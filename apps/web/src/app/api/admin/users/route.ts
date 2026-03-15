import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'
import { mockDb } from '@/lib/mock-db'

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

    const adminUser = findUserById(payload.userId)
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { message: '관리자만 접근 가능합니다' },
        { status: 403 }
      )
    }

    const users = mockDb.users.map((u) => ({
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      points: u.points,
      gems: u.gems,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
