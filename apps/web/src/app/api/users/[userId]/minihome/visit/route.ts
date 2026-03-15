import { NextRequest, NextResponse } from 'next/server'
import { findUserById, incrementVisitCount } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

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

    // Don't count self-visits
    if (payload.userId === params.userId) {
      return NextResponse.json({ visitCount: 0 })
    }

    const user = findUserById(params.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const newCount = incrementVisitCount(params.userId)

    return NextResponse.json({ visitCount: newCount })
  } catch (error) {
    console.error('Visit count error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
