/**
 * Ops 전용 Supabase 클라이언트.
 * admin-stats.ts, comments/rpc.ts 등 기존 코드와 동일한 패턴 사용.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getOpsSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}
