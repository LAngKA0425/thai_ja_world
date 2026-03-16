import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'
import {
  getCommentWriteMaintenanceMessage,
  isCommentWriteMaintenanceEnabled,
} from '@/lib/comments/maintenance'
import { deleteCommentAtomically } from '@/lib/comments/rpc'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// DELETE /api/community/posts/[id]/comments/[commentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  if (isCommentWriteMaintenanceEnabled()) {
    return NextResponse.json(
      { error: getCommentWriteMaintenanceMessage() },
      { status: 503 }
    )
  }

  const supabase = getSupabase()
  const { id: postId, commentId } = params

  // 인증 확인
  const authHeader = request.headers.get('Authorization')
  const token = extractToken(authHeader)

  if (!token) {
    return NextResponse.json(
      { message: apiMessages.auth.tokenRequired },
      { status: 401 }
    )
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { message: apiMessages.auth.invalidToken },
      { status: 401 }
    )
  }

  const userId = payload.userId

  // 댓글 존재 확인
  const { data: comment, error: commentError } = await supabase
    .from('Comment')
    .select('id, postId, authorId')
    .eq('id', commentId)
    .eq('postId', postId)
    .single()

  if (commentError || !comment) {
    return NextResponse.json(
      { error: '댓글을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  // 권한 확인: 본인 댓글 또는 관리자
  const { data: user } = await supabase
    .from('User')
    .select('id, role')
    .eq('id', userId)
    .single()

  const isOwner = comment.authorId === userId
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR'

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: '댓글을 삭제할 권한이 없습니다' },
      { status: 403 }
    )
  }

  const { commentCount, error: deleteError } = await deleteCommentAtomically({
    postId,
    commentId,
  })

  if (deleteError || commentCount === null) {
    console.error('Atomic comment delete failed:', deleteError)
    return NextResponse.json(
      { error: '댓글 삭제에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    commentCount,
  })
}
