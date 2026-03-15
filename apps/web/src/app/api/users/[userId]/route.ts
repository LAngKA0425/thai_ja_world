import { NextRequest, NextResponse } from 'next/server'
import { findUserById, updateUser } from '@/lib/mock-db'
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

    const { passwordHash, isAdmin, ...publicUser } = user

    return NextResponse.json({ user: publicUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    if (!payload || payload.userId !== params.userId) {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { avatar, character, nickname } = body

    const user = findUserById(params.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const updates: Partial<any> = {}
    if (avatar) updates.avatar = avatar
    if (character) updates.character = character
    if (nickname) updates.nickname = nickname

    const updatedUser = updateUser(params.userId, updates)
    if (!updatedUser) {
      return NextResponse.json(
        { message: '업데이트에 실패했습니다' },
        { status: 500 }
      )
    }

    const { passwordHash, isAdmin, ...publicUser } = updatedUser

    return NextResponse.json({ user: publicUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
