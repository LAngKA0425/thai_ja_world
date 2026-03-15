import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { getBackendInternalSecret, getBackendInternalUrl } from '@/lib/server-env'

const BACKEND_URL = getBackendInternalUrl()
const INTERNAL_SECRET = getBackendInternalSecret()

export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`verify-email:${ip}`, RATE_LIMITS.verifyEmail)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { message: '인증 토큰이 필요합니다' },
        { status: 400 }
      )
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/verify-email-token-internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        internal_secret: INTERNAL_SECRET,
      }),
    })

    if (!backendResponse.ok) {
      const backendData = await backendResponse.json()
      return NextResponse.json(
        { message: backendData?.detail?.message || backendData?.detail || '인증 토큰 검증에 실패했습니다' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: '이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
