import { NextRequest, NextResponse } from 'next/server'
import {
  getFriends,
  getPendingFriendRequests,
  createFriendRequest,
  findUserById,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
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

    const isPending = request.nextUrl.searchParams.get('pending') === 'true'

    if (isPending) {
      const pendingRequests = getPendingFriendRequests(payload.userId)
      return NextResponse.json({
        received: pendingRequests.map((req) => {
          const fromUser = findUserById(req.userId1)
          return {
            id: req.id,
            fromUserId: req.userId1,
            fromNickname: fromUser?.nickname || 'Unknown',
            fromAvatar: fromUser?.avatar,
            createdAt: req.createdAt,
            status: 'pending',
          }
        }),
        sent: [],
      })
    }

    const friends = getFriends(payload.userId)
    const friendsData = friends.map((friend) => ({
      id: friend.id,
      userId: friend.id,
      nickname: friend.nickname,
      avatar: friend.avatar,
      character: friend.character,
    }))

    return NextResponse.json({
      friends: friendsData,
    })
  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { message: '대상 사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    if (targetUserId === payload.userId) {
      return NextResponse.json(
        { message: '자신에게 친구 요청을 할 수 없습니다' },
        { status: 400 }
      )
    }

    const targetUser = findUserById(targetUserId)
    if (!targetUser) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const request_ = createFriendRequest(payload.userId, targetUserId)
    if (!request_) {
      return NextResponse.json(
        { message: '이미 친구이거나 요청이 존재합니다' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        id: request_.id,
        fromUserId: payload.userId,
        toUserId: targetUserId,
        status: 'pending',
        createdAt: request_.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Post friend request error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
