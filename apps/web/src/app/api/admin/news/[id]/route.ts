import { NextRequest, NextResponse } from 'next/server'
import {
  getBotSupabase,
  updateNewsReviewStatus,
  canTransition,
  type BotReviewStatus,
} from '@/lib/bots/supabase'

export const dynamic = 'force-dynamic'

function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  try {
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) return false
    return decoded.startsWith('admin:') && decoded.endsWith(`:${adminPassword}`)
  } catch {
    return false
  }
}

// PATCH /api/admin/news/[id]
// body: { action: 'approved' | 'hold' | 'failed' | 'published', notes?: string, publishCategory?: string }
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'id 필요' }, { status: 400 })
  }

  let body: { action?: string; notes?: string; publishCategory?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 바디 파싱 실패' }, { status: 400 })
  }

  const { action, notes, publishCategory } = body
  const VALID_ACTIONS: BotReviewStatus[] = ['approved', 'hold', 'failed', 'published', 'pending_review']
  if (!action || !VALID_ACTIONS.includes(action as BotReviewStatus)) {
    return NextResponse.json(
      { error: `action 은 ${VALID_ACTIONS.join(' | ')} 중 하나여야 합니다` },
      { status: 400 }
    )
  }

  const targetStatus = action as BotReviewStatus

  try {
    // 승인 → 태자월드 커뮤니티 게시 처리
    if (targetStatus === 'published') {
      const publishResult = await publishToCommunity(id)
      if (!publishResult.ok) {
        return NextResponse.json(
          { error: `게시 실패: ${publishResult.error}` },
          { status: 500 }
        )
      }
    }

    const result = await updateNewsReviewStatus(id, targetStatus, { notes, publishCategory })
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json({ ok: true, id, status: targetStatus })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[admin/news/${id}] PATCH 실패:`, msg)
    return NextResponse.json({ error: '상태 업데이트 실패' }, { status: 500 })
  }
}

// DELETE /api/admin/news/[id] - 논리 삭제(hold + notes = 삭제됨)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다' }, { status: 401 })
  }

  const { id } = await context.params

  const result = await updateNewsReviewStatus(id, 'hold', { notes: '관리자 삭제' })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ ok: true, id, status: 'hold' })
}

// ── 게시 처리 (publish_logs.review_status = approved인 항목을 CommunityPost에 삽입) ──
async function publishToCommunity(
  publishLogId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getBotSupabase()

  const { data: logData, error: logErr } = await supabase
    .from('publish_logs')
    .select(
      `id,
       review_status,
       publish_category,
       summary:summary_id (
         summary_title,
         summary_body,
         processed_news:processed_news_id (
           category,
           raw_news:raw_news_id (
             link,
             news_sources:source_id ( name )
           )
         )
       )`
    )
    .eq('id', publishLogId)
    .single()

  if (logErr || !logData) {
    return { ok: false, error: `publish_log 조회 실패: ${logErr?.message}` }
  }

  // 상태 가드: approved 또는 hold 상태만 published 로 전이 가능
  const currentStatus = logData.review_status as BotReviewStatus
  if (!canTransition(currentStatus, 'published')) {
    return { ok: false, error: `상태 전이 불가: ${currentStatus} → published` }
  }

  const summary = logData.summary as Record<string, unknown> | null
  if (!summary) {
    return { ok: false, error: 'summary 없음 - 게시 불가' }
  }

  const processedNews = summary.processed_news as Record<string, unknown> | null
  const rawNews = processedNews?.raw_news as Record<string, unknown> | null
  const sourceName = (rawNews?.news_sources as { name?: string } | null)?.name || '해외 매체'
  const sourceLink = (rawNews?.link as string) || ''

  const SOCIAL_LINKS = {
    kakao: process.env.KAKAO_OPEN_URL || process.env.OPEN_KAKAO_URL || '',
    telegram: process.env.TELEGRAM_URL || '',
    line: process.env.LINE_URL || '',
  }

  let content = (summary.summary_body as string) + '\n\n'
  content += `📰 출처: ${sourceName}\n`
  if (sourceLink) content += `🔗 원문: ${sourceLink}\n`
  if (SOCIAL_LINKS.kakao || SOCIAL_LINKS.telegram || SOCIAL_LINKS.line) {
    content += '\n---\n💬 제보 & 문의\n'
    if (SOCIAL_LINKS.kakao) content += `카카오톡: ${SOCIAL_LINKS.kakao}\n`
    if (SOCIAL_LINKS.telegram) content += `텔레그램: ${SOCIAL_LINKS.telegram}\n`
    if (SOCIAL_LINKS.line) content += `라인: ${SOCIAL_LINKS.line}\n`
  }

  const CATEGORY_MAP: Record<string, string> = {
    news: 'briefing', politics: 'briefing', economy: 'briefing',
    crime: 'incident', visa: 'visa_info',
    living: 'local_tip', traffic: 'local_tip', tourism: 'local_tip', weather: 'local_tip',
  }
  const rawCategory = (logData.publish_category || (processedNews?.category as string) || 'news')
  const postCategory = CATEGORY_MAP[rawCategory] || 'briefing'

  const postId = `newsbot-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  const { error: insertErr } = await supabase.from('CommunityPost').insert({
    id: postId,
    authorId: 'newsbot-system',
    category: postCategory,
    title: summary.summary_title as string,
    content,
    isAnonymous: false,
    moderationStatus: 'SAFE',
    viewCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  if (insertErr) {
    return { ok: false, error: `CommunityPost 삽입 실패: ${insertErr.message}` }
  }

  return { ok: true }
}
