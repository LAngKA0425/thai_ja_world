import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'
import {
  getCommentWriteMaintenanceMessage,
  isCommentWriteMaintenanceEnabled,
} from '@/lib/comments/maintenance'
import { createCommentAtomically } from '@/lib/comments/rpc'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

const COMMENT_MAX_LENGTH = 2000
const COMMENT_MIN_LENGTH = 1

// GET /api/community/posts/[id]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()
  const { id: postId } = params

  // 게시글 존재 확인
  const { data: post, error: postError } = await supabase
    .from('CommunityPost')
    .select('id')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return NextResponse.json(
      { error: '게시글을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  // 댓글 목록 조회 (createdAt ASC)
  const { data: comments, error } = await supabase
    .from('Comment')
    .select('id, postId, authorId, content, createdAt, updatedAt')
    .eq('postId', postId)
    .order('createdAt', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: '댓글을 불러올 수 없습니다' },
      { status: 500 }
    )
  }

  // 작성자 정보 조회
  const authorIds = [...new Set((comments || []).map((c: any) => c.authorId))]
  let authorMap: Record<string, { nickname: string }> = {}

  if (authorIds.length > 0) {
    const { data: users } = await supabase
      .from('User')
      .select('id, nickname')
      .in('id', authorIds)

    if (users) {
      for (const u of users) {
        authorMap[u.id] = { nickname: u.nickname || '익명' }
      }
    }
  }

  const result = (comments || []).map((c: any) => ({
    id: c.id,
    postId: c.postId,
    authorId: c.authorId,
    authorNickname: authorMap[c.authorId]?.nickname || '익명',
    content: c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))

  return NextResponse.json(result)
}

// POST /api/community/posts/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isCommentWriteMaintenanceEnabled()) {
    return NextResponse.json(
      { error: getCommentWriteMaintenanceMessage() },
      { status: 503 }
    )
  }

  const supabase = getSupabase()
  const { id: postId } = params

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

  const authorId = payload.userId

  // 요청 본문 파싱
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다' },
      { status: 400 }
    )
  }

  const content = typeof body.content === 'string' ? body.content.trim() : ''

  // 입력 검증
  if (content.length < COMMENT_MIN_LENGTH) {
    return NextResponse.json(
      { error: '댓글 내용을 입력해 주세요' },
      { status: 400 }
    )
  }

  if (content.length > COMMENT_MAX_LENGTH) {
    return NextResponse.json(
      { error: `댓글은 ${COMMENT_MAX_LENGTH}자 이내로 작성해 주세요` },
      { status: 400 }
    )
  }

  // 게시글 존재 확인
  const { data: post, error: postError } = await supabase
    .from('CommunityPost')
    .select('id')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return NextResponse.json(
      { error: '게시글을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  // 사용자 존재 확인
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('id, nickname, status')
    .eq('id', authorId)
    .single()

  if (userError || !user) {
    return NextResponse.json(
      { error: '사용자를 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
    return NextResponse.json(
      { error: '댓글 작성이 제한된 사용자입니다' },
      { status: 403 }
    )
  }

  const { data: comment, error: createError } = await createCommentAtomically({
    postId,
    authorId,
    content,
  })

  if (createError || !comment) {
    console.error('Atomic comment create failed:', createError)
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    authorNickname: user.nickname || '익명',
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    commentCount: comment.commentCount,
  }, { status: 201 })
}
