/**
 * 봇 관리용 Supabase 헬퍼
 * 서버 사이드(API route)에서만 사용. SUPABASE_SERVICE_KEY 필수.
 * 클라이언트 컴포넌트에서 import 금지.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getBotSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_KEY || ''
  if (!url || !key) {
    throw new Error('[봇 Supabase] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 가 설정되지 않았습니다.')
  }
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

// ── 봇 리뷰 큐 타입 ─────────────────────────────────────

export type BotReviewStatus =
  | 'pending_review'
  | 'approved'
  | 'hold'
  | 'failed'
  | 'published'

export type BotType = 'newsbot' | 'radarbot'

export interface BotReviewItem {
  id: string
  bot_type: BotType
  ref_id: string           // summaries.id 또는 radarbot_items.id
  review_status: BotReviewStatus
  publish_category: string
  headline: string
  briefing: string
  summary_body: string
  source_link?: string
  source_name?: string
  notes?: string
  error_message?: string
  created_at: string
  updated_at: string
  published_at?: string
}

// ── 상태 전이 가드 ────────────────────────────────────────
// 허용된 전이만 통과. 그 외 모두 거부.
const ALLOWED_TRANSITIONS: Record<BotReviewStatus, BotReviewStatus[]> = {
  pending_review: ['approved', 'hold', 'failed'],
  approved: ['published', 'hold'],        // 재발행 허용, 재승인 불가(→ already approved)
  hold: ['pending_review', 'approved', 'failed'],
  failed: ['pending_review'],             // 재시도만 허용
  published: [],                          // 종료 상태 - 변경 불가
}

export function canTransition(from: BotReviewStatus, to: BotReviewStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

// ── 뉴스봇 리뷰 큐 조회 ──────────────────────────────────

export interface NewsReviewRow {
  id: string
  review_status: string
  publish_category: string
  created_at: string
  updated_at: string
  published_at: string | null
  notes: string | null
  error_message: string | null
  summary: {
    id: string
    summary_title: string
    summary_briefing: string | null
    summary_body: string
    translated_title: string | null
    kakao_short: string | null
    translate_model: string | null
    copy_model: string | null
    translate_failed: boolean
    copy_failed: boolean
    processed_news: {
      id: string
      category: string
      language: string
      raw_news: {
        link: string
        news_sources: { name: string } | null
      } | null
    } | null
  } | null
}

export async function getNewsReviewQueue(
  status: BotReviewStatus | 'all' = 'pending_review',
  limit = 50,
  offset = 0
): Promise<{ items: NewsReviewRow[]; total: number }> {
  const supabase = getBotSupabase()

  let query = supabase
    .from('publish_logs')
    .select(
      `id,
       review_status,
       publish_category,
       created_at,
       updated_at,
       published_at,
       notes,
       error_message,
       summary:summary_id (
         id,
         summary_title,
         summary_briefing,
         summary_body,
         translated_title,
         kakao_short,
         translate_model,
         copy_model,
         translate_failed,
         copy_failed,
         processed_news:processed_news_id (
           id,
           category,
           language,
           raw_news:raw_news_id (
             link,
             news_sources:source_id ( name )
           )
         )
       )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') {
    query = query.eq('review_status', status)
  }

  const { data, error, count } = await query
  if (error) throw new Error(`뉴스 리뷰 큐 조회 실패: ${error.message}`)

  return { items: (data || []) as NewsReviewRow[], total: count ?? 0 }
}

// ── 상태 업데이트 (상태머신 가드 포함) ───────────────────

export async function updateNewsReviewStatus(
  publishLogId: string,
  newStatus: BotReviewStatus,
  options: { notes?: string; publishCategory?: string } = {}
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getBotSupabase()

  // 현재 상태 조회
  const { data: current, error: fetchErr } = await supabase
    .from('publish_logs')
    .select('review_status')
    .eq('id', publishLogId)
    .maybeSingle()

  if (fetchErr || !current) {
    return { ok: false, error: `항목을 찾을 수 없음: ${fetchErr?.message}` }
  }

  const fromStatus = current.review_status as BotReviewStatus

  // 상태 전이 가드
  if (!canTransition(fromStatus, newStatus)) {
    return {
      ok: false,
      error: `상태 전이 불가: ${fromStatus} → ${newStatus}`
    }
  }

  const updates: Record<string, unknown> = {
    review_status: newStatus,
    updated_at: new Date().toISOString()
  }

  if (options.notes) updates.notes = options.notes
  if (options.publishCategory) updates.publish_category = options.publishCategory
  if (newStatus === 'published') updates.published_at = new Date().toISOString()
  // published 상태로 전이 시 status 필드도 동기화
  if (newStatus === 'published') updates.status = 'published'

  const { error: updateErr } = await supabase
    .from('publish_logs')
    .update(updates)
    .eq('id', publishLogId)

  if (updateErr) {
    return { ok: false, error: `업데이트 실패: ${updateErr.message}` }
  }

  return { ok: true }
}

// ── 운영 로그 조회 ────────────────────────────────────────

export interface BotJobLog {
  id: string
  bot_type: string
  ref_id: string
  stage: string
  status: string
  notes: string | null
  error_message: string | null
  created_at: string
}

export async function getBotJobLogs(
  botType: BotType | 'all' = 'all',
  limit = 100,
  offset = 0
): Promise<{ items: BotJobLog[]; total: number }> {
  const supabase = getBotSupabase()

  let query = supabase
    .from('bot_job_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (botType !== 'all') {
    query = query.eq('bot_type', botType)
  }

  const { data, error, count } = await query
  if (error) throw new Error(`운영 로그 조회 실패: ${error.message}`)

  return { items: (data || []) as BotJobLog[], total: count ?? 0 }
}

// ── 뉴스봇 통계 ───────────────────────────────────────────

export async function getNewsBotStats() {
  const supabase = getBotSupabase()

  const [pendingRes, approvedRes, publishedRes, failedRes, todayRes] = await Promise.all([
    supabase.from('publish_logs').select('id', { count: 'exact', head: true }).eq('review_status', 'pending_review'),
    supabase.from('publish_logs').select('id', { count: 'exact', head: true }).eq('review_status', 'approved'),
    supabase.from('publish_logs').select('id', { count: 'exact', head: true }).eq('review_status', 'published'),
    supabase.from('publish_logs').select('id', { count: 'exact', head: true }).eq('review_status', 'failed'),
    supabase
      .from('publish_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
  ])

  return {
    pendingReview: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    published: publishedRes.count ?? 0,
    failed: failedRes.count ?? 0,
    todayCollected: todayRes.count ?? 0,
  }
}
