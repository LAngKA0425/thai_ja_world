import { NextRequest, NextResponse } from 'next/server'
import { extractToken, verifyToken } from '@/lib/jwt'
import { updateLastSeen } from '@/lib/admin-stats'

export const dynamic = 'force-dynamic'

// POST /api/activity - 인증된 사용자의 lastLoginAt 갱신 (throttle 적용)
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
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    const updated = await updateLastSeen(payload.userId)

    return NextResponse.json({ updated })
  } catch (error) {
    console.error('Activity update error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
