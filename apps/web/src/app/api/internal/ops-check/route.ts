import { NextRequest, NextResponse } from 'next/server'
import { runOpsCheckAndNotify } from '@/lib/ops/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function verifyOpsSecret(request: NextRequest): boolean {
  const secret = process.env.OPS_SHARED_SECRET
  if (!secret || secret.trim() === '') {
    // secret 미설정 시 localhost 요청만 허용
    const host = request.headers.get('host') || ''
    return host.startsWith('localhost') || host.startsWith('127.0.0.1')
  }
  const provided = request.headers.get('x-ops-secret') || ''
  return provided === secret.trim()
}

export async function POST(request: NextRequest) {
  if (!verifyOpsSecret(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  try {
    const report = await runOpsCheckAndNotify()
    return NextResponse.json({
      status: report.overallStatus,
      timestamp: report.timestamp,
      environment: report.environment,
      dbTarget: report.db?.supabaseUrl || '(unknown)',
      db: report.db?.ok ? 'ok' : 'fail',
      tables: report.tables?.ok ? 'ok' : `missing: ${report.tables?.missingTables.join(', ')}`,
      commentMismatch: report.comments?.mismatchCount ?? null,
      adminStats: report.adminStats?.ok ? 'ok' : 'fail',
      commentWritePath: report.commentWritePath?.ok ? 'ok' : 'fail',
      errors: report.errors,
    })
  } catch (err: any) {
    console.error('[ops-check] runner failed:', err)
    return NextResponse.json(
      { error: 'ops check failed', detail: err?.message || 'unknown' },
      { status: 500 }
    )
  }
}
