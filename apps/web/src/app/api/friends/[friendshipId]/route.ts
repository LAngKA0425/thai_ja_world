import { NextRequest, NextResponse } from 'next/server'
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendship,
  findUserById,
  getFriends,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

export async function PUT(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
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

    const body = await request.json()
    const { action } = body

    if (action === 'accept') {
      const friendship = acceptFriendRequest(params.friendshipId)
      if (!friendship) {
        return NextResponse.json(
          { message: '친구 요청을 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      const newFriend = findUserById(
        friendship.userId1 === payload.userId ? friendship.userId2 : friendship.userId1
      )
      if (!newFriend) {
        return NextResponse.json(
          { message: '새로운 친구 정보를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        newFriend: {
          id: newFriend.id,
          userId: newFriend.id,
          nickname: newFriend.nickname,
          avatar: newFriend.avatar,
          character: newFriend.character,
        },
      })
    } else if (action === 'reject') {
      const success = rejectFriendRequest(params.friendshipId)
      if (!success) {
        return NextResponse.json(
          { message: '친구 요청을 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { message: '유효하지 않은 액션입니다' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Update friendship error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
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

    const success = removeFriendship(params.friendshipId)
    if (!success) {
      return NextResponse.json(
        { message: '친구 관계를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete friendship error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
