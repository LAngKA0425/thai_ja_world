/**
 * 뉴스봇 파이프라인 수동 실행 트리거
 *
 * POST /api/admin/news/pipeline
 * body: { step: 'collect' | 'process' | 'summarize' | 'all' }
 *
 * 보안:
 * - 관리자 Bearer 토큰 또는 OPS_SHARED_SECRET 헤더 모두 허용
 * - OPS_SHARED_SECRET 미설정 시 해당 경로 fail-closed
 * - 파이프라인은 newsbot 디렉토리를 child_process로 실행
 *   → 실제 배포에서는 별도 큐(예: BullMQ) 또는 Supabase Edge Function 으로 교체 권장
 */
import { NextRequest, NextResponse } from 'next/server'
import { getBotSupabase } from '@/lib/bots/supabase'

export const dynamic = 'force-dynamic'

const ALLOWED_STEPS = ['collect', 'process', 'summarize', 'all'] as const
type PipelineStep = (typeof ALLOWED_STEPS)[number]

function verifyAccess(request: NextRequest): boolean {
  // 1) 관리자 Bearer 토큰
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
      const adminPassword = process.env.ADMIN_PASSWORD
      if (adminPassword && decoded.startsWith('admin:') && decoded.endsWith(`:${adminPassword}`)) {
        return true
      }
    } catch {
      // ignore
    }
  }

  // 2) 내부 서비스용 shared secret
  const sharedSecret = process.env.OPS_SHARED_SECRET
  if (!sharedSecret) return false   // fail-closed: secret 미설정 시 차단
  const headerSecret = request.headers.get('x-ops-secret')
  return headerSecret === sharedSecret
}

// ops_events 테이블에 이벤트 기록 (테이블 없으면 조용히 실패)
async function logOpsEvent(
  event: string,
  step: string,
  status: 'started' | 'success' | 'failed',
  notes = ''
) {
  try {
    const supabase = getBotSupabase()
    await supabase.from('ops_events').insert({
      bot_type: 'newsbot',
      event,
      step,
      status,
      notes: notes.substring(0, 500),
      created_at: new Date().toISOString(),
    })
  } catch {
    // ops 로깅 실패가 메인 로직에 영향 주지 않도록 조용히 무시
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAccess(request)) {
    return NextResponse.json({ error: '인증 필요 (관리자 토큰 또는 OPS_SHARED_SECRET)' }, { status: 401 })
  }

  let body: { step?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 바디 파싱 실패' }, { status: 400 })
  }

  const step = (body.step || 'all') as PipelineStep
  if (!ALLOWED_STEPS.includes(step)) {
    return NextResponse.json(
      { error: `step 은 ${ALLOWED_STEPS.join(' | ')} 중 하나여야 합니다` },
      { status: 400 }
    )
  }

  // newsbot 루트 경로
  const newsbotRoot = process.env.NEWSBOT_ROOT_PATH || '/app/newsbot'

  // 어떤 스크립트를 실행할지 결정
  const scriptMap: Record<PipelineStep, string> = {
    collect: 'collector/collect.js',
    process: 'processor/process.js',
    summarize: 'summarizer/summarize.js',
    all: 'scripts/run-pipeline.js',
  }
  const script = scriptMap[step]

  await logOpsEvent('manual_trigger', step, 'started', `script=${script}`)

  // 실제 실행은 비동기 (응답 즉시 반환, 백그라운드 실행)
  // 프로덕션에서는 BullMQ/Inngest 큐로 교체 권장
  runScriptBackground(newsbotRoot, script, step).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[pipeline] 백그라운드 실행 실패 (${step}):`, msg)
    logOpsEvent('manual_trigger', step, 'failed', msg)
  })

  return NextResponse.json({
    ok: true,
    step,
    message: `${step} 파이프라인이 백그라운드에서 시작되었습니다.`,
    startedAt: new Date().toISOString(),
  })
}

async function runScriptBackground(
  cwd: string,
  script: string,
  step: string
): Promise<void> {
  const { spawn } = await import('child_process')

  return new Promise((resolve, reject) => {
    const proc = spawn('node', [script], {
      cwd,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env },
    })

    proc.on('error', (err) => {
      logOpsEvent('manual_trigger', step, 'failed', err.message)
      reject(err)
    })

    proc.on('close', (code) => {
      const status = code === 0 ? 'success' : 'failed'
      logOpsEvent('manual_trigger', step, status, `exit=${code}`)
      if (code !== 0) {
        console.error(`[pipeline] 스크립트 종료 실패 (${step}): exit=${code}`)
      }
      resolve()
    })

    proc.unref()
  })
}
