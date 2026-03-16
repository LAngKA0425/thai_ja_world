import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export interface AtomicCommentCreateResult {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  commentCount: number
}

export async function createCommentAtomically(params: {
  postId: string
  authorId: string
  content: string
}): Promise<{ data: AtomicCommentCreateResult | null; error: unknown }> {
  const supabase = getSupabase()

  const { data, error } = await supabase.rpc('create_comment_with_count', {
    p_post_id: params.postId,
    p_author_id: params.authorId,
    p_content: params.content,
  })

  if (error) {
    return { data: null, error }
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    return { data: null, error: new Error('EMPTY_RPC_RESULT') }
  }

  return {
    data: {
      id: row.id,
      postId: row.postId,
      authorId: row.authorId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      commentCount: row.commentCount,
    },
    error: null,
  }
}

export async function deleteCommentAtomically(params: {
  postId: string
  commentId: string
}): Promise<{ commentCount: number | null; error: unknown }> {
  const supabase = getSupabase()

  const { data, error } = await supabase.rpc('delete_comment_with_count', {
    p_post_id: params.postId,
    p_comment_id: params.commentId,
  })

  if (error) {
    return { commentCount: null, error }
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row || typeof row.commentCount !== 'number') {
    return { commentCount: null, error: new Error('EMPTY_RPC_RESULT') }
  }

  return { commentCount: row.commentCount, error: null }
}
