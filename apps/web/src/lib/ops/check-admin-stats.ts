/**
 * 관리자 통계 함수 상태 점검.
 * 외부 HTTP self-call 대신 getAdminDashboardStats 함수를 직접 호출하여 점검.
 * 함수가 정상적으로 결과를 반환하는지 확인.
 */

import { getAdminDashboardStats } from '@/lib/admin-stats'

export interface AdminStatsCheckResult {
  ok: boolean
  totalUsers?: number
  error?: string
}

export async function checkAdminStats(): Promise<AdminStatsCheckResult> {
  try {
    const stats = await getAdminDashboardStats()

    if (typeof stats.totalUsers !== 'number') {
      return { ok: false, error: 'totalUsers is not a number' }
    }

    return { ok: true, totalUsers: stats.totalUsers }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'unknown' }
  }
}
