/**
 * DB 연결 상태 점검.
 * User 테이블에 count 쿼리를 보내 DB가 살아있는지 확인.
 */

import { getOpsSupabase } from './supabase'

export interface DbCheckResult {
  ok: boolean
  latencyMs: number
  supabaseUrl: string
  error?: string
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.hostname}`
  } catch {
    if (!url) return '(empty)'
    return url.substring(0, 30) + '...'
  }
}

function resolveSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
}

export async function checkDbConnection(): Promise<DbCheckResult> {
  const start = Date.now()
  const rawUrl = resolveSupabaseUrl()
  const supabaseUrl = maskUrl(rawUrl)

  try {
    const supabase = getOpsSupabase()
    const { error } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })

    const latencyMs = Date.now() - start

    if (error) {
      return { ok: false, latencyMs, supabaseUrl, error: error.message }
    }

    return { ok: true, latencyMs, supabaseUrl }
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, supabaseUrl, error: err?.message || 'unknown' }
  }
}
