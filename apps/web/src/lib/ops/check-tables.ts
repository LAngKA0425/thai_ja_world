/**
 * 핵심 테이블 존재 여부 점검.
 * 각 테이블에 head count 쿼리를 보내 테이블 접근 가능 여부 확인.
 * 테이블이 없거나 접근 불가이면 error 반환.
 */

import { getOpsSupabase } from './supabase'

const REQUIRED_TABLES = ['User', 'CommunityPost', 'Comment', 'Report'] as const

export interface TableCheckResult {
  table: string
  exists: boolean
  error?: string
}

export interface TablesCheckResult {
  ok: boolean
  tables: TableCheckResult[]
  missingTables: string[]
}

export async function checkRequiredTables(): Promise<TablesCheckResult> {
  const supabase = getOpsSupabase()
  const results: TableCheckResult[] = []

  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        results.push({ table, exists: false, error: error.message })
      } else {
        results.push({ table, exists: true })
      }
    } catch (err: any) {
      results.push({ table, exists: false, error: err?.message || 'unknown' })
    }
  }

  const missingTables = results.filter(r => !r.exists).map(r => r.table)

  return {
    ok: missingTables.length === 0,
    tables: results,
    missingTables,
  }
}
