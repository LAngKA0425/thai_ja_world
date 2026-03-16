/**
 * Ops Check Runner.
 * 모든 점검 항목을 실행하고 결과를 집계한 뒤 슬랙 알림을 전송.
 *
 * 개별 점검이 실패해도 나머지 점검은 계속 진행.
 * 최종 결과를 하나의 보고 객체로 정리.
 */

import { checkDbConnection, DbCheckResult } from './check-db'
import { checkRequiredTables, TablesCheckResult } from './check-tables'
import { checkCommentConsistency, CommentsCheckResult } from './check-comments'
import { checkAdminStats, AdminStatsCheckResult } from './check-admin-stats'
import { checkCommentWritePath, CommentWritePathCheckResult } from './check-comment-write-path'
import { sendOpsSlackMessage, buildOpsMessage } from '@/lib/slack/sender'

export interface OpsCheckReport {
  timestamp: string
  environment: string
  db: DbCheckResult | null
  tables: TablesCheckResult | null
  comments: CommentsCheckResult | null
  adminStats: AdminStatsCheckResult | null
  commentWritePath: CommentWritePathCheckResult | null
  overallStatus: 'ok' | 'warning' | 'critical'
  errors: string[]
}

function getEnvironment(): string {
  return process.env.OPS_ENVIRONMENT || process.env.NODE_ENV || 'unknown'
}

function isOpsEnabled(): boolean {
  const val = process.env.OPS_CHECK_ENABLED
  if (!val) return true // 기본 활성화
  return !['0', 'false', 'no', 'off'].includes(val.trim().toLowerCase())
}

export async function runOpsCheck(): Promise<OpsCheckReport> {
  const report: OpsCheckReport = {
    timestamp: new Date().toISOString(),
    environment: getEnvironment(),
    db: null,
    tables: null,
    comments: null,
    adminStats: null,
    commentWritePath: null,
    overallStatus: 'ok',
    errors: [],
  }

  if (!isOpsEnabled()) {
    report.errors.push('OPS_CHECK_ENABLED is off — skipped')
    return report
  }

  // 1. DB 연결 점검
  try {
    report.db = await checkDbConnection()
    if (!report.db.ok) {
      report.overallStatus = 'critical'
      report.errors.push(`DB connection failed: ${report.db.error}`)
    }
  } catch (err: any) {
    report.db = { ok: false, latencyMs: 0, supabaseUrl: '(exception)', error: err?.message || 'unknown' }
    report.overallStatus = 'critical'
    report.errors.push(`DB check exception: ${err?.message}`)
  }

  // 2. 핵심 테이블 존재 점검
  try {
    report.tables = await checkRequiredTables()
    if (!report.tables.ok) {
      report.overallStatus = 'critical'
      report.errors.push(`Missing tables: ${report.tables.missingTables.join(', ')}`)
    }
  } catch (err: any) {
    report.tables = { ok: false, tables: [], missingTables: [] }
    report.errors.push(`Tables check exception: ${err?.message}`)
    if (report.overallStatus !== 'critical') report.overallStatus = 'critical'
  }

  // 3. 댓글 정합성 점검
  try {
    report.comments = await checkCommentConsistency()
    if (!report.comments.ok) {
      if (report.comments.error) {
        report.overallStatus = 'critical'
        report.errors.push(`Comment consistency error: ${report.comments.error}`)
      } else if (report.comments.mismatchCount > 0) {
        if (report.overallStatus === 'ok') report.overallStatus = 'warning'
        report.errors.push(`commentCount mismatch: ${report.comments.mismatchCount} posts`)
      }
    }
  } catch (err: any) {
    report.comments = { ok: false, checkedPosts: 0, mismatchCount: 0, sampleMismatches: [], error: err?.message }
    report.errors.push(`Comment check exception: ${err?.message}`)
  }

  // 4. 관리자 통계 점검
  try {
    report.adminStats = await checkAdminStats()
    if (!report.adminStats.ok) {
      if (report.overallStatus === 'ok') report.overallStatus = 'warning'
      report.errors.push(`Admin stats failed: ${report.adminStats.error}`)
    }
  } catch (err: any) {
    report.adminStats = { ok: false, error: err?.message }
    report.errors.push(`Admin stats exception: ${err?.message}`)
  }

  // 5. 댓글 write path 점검
  try {
    report.commentWritePath = await checkCommentWritePath()
    if (!report.commentWritePath.ok) {
      if (report.commentWritePath.missingRpcs.length > 0) {
        report.overallStatus = 'critical'
        report.errors.push(`Missing RPCs: ${report.commentWritePath.missingRpcs.join(', ')}`)
      } else if (!report.commentWritePath.commentTableAccessible) {
        report.overallStatus = 'critical'
        report.errors.push('Comment table not accessible')
      } else {
        if (report.overallStatus === 'ok') report.overallStatus = 'warning'
      }
    }
  } catch (err: any) {
    report.commentWritePath = { ok: false, commentTableAccessible: false, rpcs: [], missingRpcs: [] }
    report.errors.push(`Comment write path exception: ${err?.message}`)
  }

  return report
}

export async function runOpsCheckAndNotify(): Promise<OpsCheckReport> {
  const report = await runOpsCheck()
  const env = report.environment
  const dbTarget = report.db?.supabaseUrl || '(unknown)'

  // severity 결정
  const hasCritical = report.overallStatus === 'critical'
  const hasWarning = report.overallStatus === 'warning'

  // Critical 알림
  if (hasCritical) {
    await sendOpsSlackMessage(buildOpsMessage('CRITICAL', 'ops check — critical issues detected', {
      environment: env,
      db_target: dbTarget,
      db: report.db?.ok ? 'ok' : `FAIL (${report.db?.error || 'unknown'})`,
      tables: report.tables?.ok ? 'ok' : `MISSING: ${report.tables?.missingTables.join(', ') || 'check failed'}`,
      comment_write_path: report.commentWritePath?.ok ? 'ok' : `FAIL (missing RPCs: ${report.commentWritePath?.missingRpcs.join(', ') || 'unknown'})`,
      admin_stats: report.adminStats?.ok ? 'ok' : `FAIL`,
      errors: report.errors.slice(0, 5).join(' | '),
    }))
  }

  // High 알림 (mismatch 등)
  if (hasWarning && report.comments && report.comments.mismatchCount > 0) {
    const sampleIds = report.comments.sampleMismatches.map(m => m.postId).join(', ')
    await sendOpsSlackMessage(buildOpsMessage('HIGH', 'commentCount mismatch detected', {
      environment: env,
      db_target: dbTarget,
      mismatch_posts: report.comments.mismatchCount,
      checked_posts: report.comments.checkedPosts,
      sample_post_ids: sampleIds || 'none',
    }))
  }

  if (hasWarning && report.adminStats && !report.adminStats.ok) {
    await sendOpsSlackMessage(buildOpsMessage('HIGH', 'admin stats check failed', {
      environment: env,
      db_target: dbTarget,
      error: report.adminStats.error || 'unknown',
    }))
  }

  // 정상이면 INFO
  if (!hasCritical && !hasWarning) {
    await sendOpsSlackMessage(buildOpsMessage('INFO', 'ops check completed — all clear', {
      environment: env,
      db_target: dbTarget,
      db: `ok (${report.db?.latencyMs ?? '?'}ms)`,
      tables: 'ok',
      admin_stats: report.adminStats?.ok ? `ok (${report.adminStats.totalUsers ?? '?'} users)` : 'skipped',
      mismatch_posts: report.comments?.mismatchCount ?? 0,
      comment_write_path: 'ok',
    }))
  }

  return report
}
