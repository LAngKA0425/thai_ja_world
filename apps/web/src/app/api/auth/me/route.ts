import { NextRequest, NextResponse } from 'next/server'
import { extractToken, verifyToken } from '@/lib/jwt'
import { getBackendInternalSecret, getBackendInternalUrl } from '@/lib/server-env'

const BACKEND_URL = getBackendInternalUrl()
const INTERNAL_SECRET = getBackendInternalSecret()

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

    // Fetch user details from FastAPI backend using email
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/user-by-email-internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        internal_secret: INTERNAL_SECRET,
      }),
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: '사용자 정보를 가져올 수 없습니다' },
        { status: 500 }
      )
    }

    const backendData = await backendResponse.json()

    if (!backendData.found) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const user = backendData.user

    // 이메일 인증 안 된 사용자는 접근 차단
    if (!user.email_verified) {
      return NextResponse.json(
        { message: '이메일 인증이 필요합니다', requiresVerification: true },
        { status: 403 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        points: 0,
        gems: 0,
        emailVerified: user.email_verified,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
