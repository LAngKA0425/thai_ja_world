/**
 * 댓글 정합성 점검.
 * CommunityPost.commentCount vs 실제 Comment row count 비교.
 *
 * Supabase에서 raw SQL 집계가 제한적이므로:
 * 1) commentCount > 0 인 게시글을 가져옴 (최대 200건)
 * 2) 각 게시글별 실제 Comment count를 조회
 * 3) mismatch 비교
 *
 * 운영 부하를 최소화하기 위해 한번에 200건까지만 점검.
 */

import { getOpsSupabase } from './supabase'

export interface CommentMismatch {
  postId: string
  expected: number
  actual: number
}

export interface CommentsCheckResult {
  ok: boolean
  checkedPosts: number
  mismatchCount: number
  sampleMismatches: CommentMismatch[]
  error?: string
}

const MAX_CHECK_POSTS = 200
const MAX_SAMPLE = 5

export async function checkCommentConsistency(): Promise<CommentsCheckResult> {
  try {
    const supabase = getOpsSupabase()

    // commentCount가 0보다 큰 게시글 조회
    const { data: posts, error: postsError } = await supabase
      .from('CommunityPost')
      .select('id, commentCount')
      .gt('commentCount', 0)
      .order('updatedAt', { ascending: false })
      .limit(MAX_CHECK_POSTS)

    if (postsError) {
      return { ok: false, checkedPosts: 0, mismatchCount: 0, sampleMismatches: [], error: postsError.message }
    }

    if (!posts || posts.length === 0) {
      // commentCount > 0 인 게시글이 없으면 commentCount=0 게시글도 확인
      const { data: zeroPosts, error: zeroError } = await supabase
        .from('CommunityPost')
        .select('id')
        .eq('commentCount', 0)
        .limit(10)

      if (zeroError) {
        return { ok: false, checkedPosts: 0, mismatchCount: 0, sampleMismatches: [], error: zeroError.message }
      }

      // commentCount=0 게시글 중 실제 댓글이 있는지 샘플 확인
      const mismatches: CommentMismatch[] = []
      for (const p of (zeroPosts || []).slice(0, 5)) {
        const { count, error: cErr } = await supabase
          .from('Comment')
          .select('*', { count: 'exact', head: true })
          .eq('postId', p.id)

        if (!cErr && count !== null && count > 0) {
          mismatches.push({ postId: p.id, expected: 0, actual: count })
        }
      }

      return {
        ok: mismatches.length === 0,
        checkedPosts: (zeroPosts || []).length,
        mismatchCount: mismatches.length,
        sampleMismatches: mismatches.slice(0, MAX_SAMPLE),
      }
    }

    const mismatches: CommentMismatch[] = []

    for (const post of posts) {
      const { count, error: countError } = await supabase
        .from('Comment')
        .select('*', { count: 'exact', head: true })
        .eq('postId', post.id)

      if (countError) {
        continue
      }

      const actualCount = count ?? 0
      if (actualCount !== post.commentCount) {
        mismatches.push({
          postId: post.id,
          expected: post.commentCount,
          actual: actualCount,
        })
      }
    }

    return {
      ok: mismatches.length === 0,
      checkedPosts: posts.length,
      mismatchCount: mismatches.length,
      sampleMismatches: mismatches.slice(0, MAX_SAMPLE),
    }
  } catch (err: any) {
    return {
      ok: false,
      checkedPosts: 0,
      mismatchCount: 0,
      sampleMismatches: [],
      error: err?.message || 'unknown',
    }
  }
}
