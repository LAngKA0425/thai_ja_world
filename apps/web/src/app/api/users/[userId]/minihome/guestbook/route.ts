import { NextRequest, NextResponse } from 'next/server'
import {
  findUserById,
  getGuestbookEntries,
  addGuestbookEntry,
  deleteGuestbookEntry,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = findUserById(params.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const entries = getGuestbookEntries(params.userId)
    return NextResponse.json({
      userId: params.userId,
      entries: entries.map((entry) => ({
        id: entry.id,
        visitorId: entry.authorId,
        visitorNickname: entry.authorNickname,
        visitorAvatar: entry.authorAvatar,
        message: entry.content,
        createdAt: entry.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get guestbook error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { message: '인증 토큰이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    const user = findUserById(params.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const visitorUser = findUserById(payload.userId)
    if (!visitorUser) {
      return NextResponse.json(
        { message: '방문자 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { message: '메시지를 입력해주세요' },
        { status: 400 }
      )
    }

    if (message.length > 500) {
      return NextResponse.json(
        { message: '메시지는 500자 이하여야 합니다' },
        { status: 400 }
      )
    }

    const entry = addGuestbookEntry(params.userId, payload.userId, message.trim())
    if (!entry) {
      return NextResponse.json(
        { message: '방명록 작성에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: entry.id,
      visitorId: entry.authorId,
      visitorNickname: entry.authorNickname,
      visitorAvatar: entry.authorAvatar,
      message: entry.content,
      createdAt: entry.createdAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Post guestbook error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { message: '인증 토큰이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    const entryId = request.nextUrl.searchParams.get('entryId')
    if (!entryId) {
      return NextResponse.json(
        { message: '방명록 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const deleted = deleteGuestbookEntry(entryId, payload.userId)
    if (!deleted) {
      return NextResponse.json(
        { message: '방명록 삭제에 실패했습니다' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete guestbook error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
