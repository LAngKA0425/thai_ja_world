/**
 * 댓글 write path 의존 구조 점검.
 *
 * 현재 댓글 작성은 Supabase RPC 'create_comment_with_count' 에 의존.
 * 삭제는 'delete_comment_with_count' 에 의존.
 *
 * 이 점검에서는:
 * 1) Comment 테이블 접근 가능 여부
 * 2) RPC 함수 존재 여부 (빈 파라미터로 호출 시 에러 유형으로 판별)
 *    - 함수가 없으면: "Could not find the function" 또는 404 계열
 *    - 함수가 있으면: 파라미터 오류 (예: null 값) → 이는 함수 존재를 의미
 */

import { getOpsSupabase } from './supabase'

const REQUIRED_RPCS = ['create_comment_with_count', 'delete_comment_with_count'] as const

export interface RpcCheckResult {
  name: string
  exists: boolean
  error?: string
}

export interface CommentWritePathCheckResult {
  ok: boolean
  commentTableAccessible: boolean
  rpcs: RpcCheckResult[]
  missingRpcs: string[]
  error?: string
}

export async function checkCommentWritePath(): Promise<CommentWritePathCheckResult> {
  const supabase = getOpsSupabase()
  const rpcs: RpcCheckResult[] = []
  let commentTableAccessible = false

  // Comment 테이블 접근 확인
  try {
    const { error } = await supabase
      .from('Comment')
      .select('*', { count: 'exact', head: true })

    commentTableAccessible = !error
  } catch {
    commentTableAccessible = false
  }

  // RPC 존재 여부 확인 — 각 함수의 실제 파라미터 시그니처에 맞춰 호출
  const RPC_PARAMS: Record<string, Record<string, string>> = {
    create_comment_with_count: {
      p_post_id: '00000000-0000-0000-0000-000000000000',
      p_author_id: '00000000-0000-0000-0000-000000000000',
      p_content: '__ops_check_probe__',
    },
    delete_comment_with_count: {
      p_post_id: '00000000-0000-0000-0000-000000000000',
      p_comment_id: '00000000-0000-0000-0000-000000000000',
    },
  }

  for (const rpcName of REQUIRED_RPCS) {
    try {
      const params = RPC_PARAMS[rpcName] || {}
      const { error } = await supabase.rpc(rpcName, params)

      if (error) {
        const msg = error.message || ''
        // 함수가 없으면 "Could not find the function" 또는 유사 메시지
        const notFound = msg.toLowerCase().includes('could not find') ||
          msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist') ||
          error.code === '42883'

        if (notFound) {
          rpcs.push({ name: rpcName, exists: false, error: msg })
        } else {
          // 함수는 존재하지만 파라미터 오류/FK 위반 등 → 함수 존재
          rpcs.push({ name: rpcName, exists: true })
        }
      } else {
        // 호출 성공 (probe 데이터가 삽입되었을 수도 있음 — 하지만 FK 제약으로 실패할 것)
        rpcs.push({ name: rpcName, exists: true })
      }
    } catch (err: any) {
      rpcs.push({ name: rpcName, exists: false, error: err?.message || 'unknown' })
    }
  }

  const missingRpcs = rpcs.filter(r => !r.exists).map(r => r.name)

  return {
    ok: commentTableAccessible && missingRpcs.length === 0,
    commentTableAccessible,
    rpcs,
    missingRpcs,
  }
}
