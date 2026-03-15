import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/jwt'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { getBackendInternalUrl } from '@/lib/server-env'

const BACKEND_URL = getBackendInternalUrl()

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`login:${ip}`, RATE_LIMITS.login)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호가 필요합니다' },
        { status: 400 }
      )
    }

    // Call FastAPI backend for authentication
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      const detail = backendData?.detail
      const msg = typeof detail === 'object' ? detail?.message : detail
      const message = typeof msg === 'string' ? msg : '이메일 또는 비밀번호가 잘못되었습니다'

      // 이메일 인증 미완료 시 특별 처리
      if (backendResponse.status === 403 && message.includes('이메일 인증')) {
        return NextResponse.json(
          {
            message,
            requiresVerification: true,
            email,
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { message },
        { status: backendResponse.status }
      )
    }

    // FastAPI returns {access_token, refresh_token, token_type}
    // Now fetch user details using the access token
    const meResponse = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${backendData.access_token}` },
    })

    let userData: any = null
    if (meResponse.ok) {
      userData = await meResponse.json()
    }

    // Issue a Next.js JWT for the frontend
    const token = await signToken({
      userId: userData?.id || '',
      email: email,
    })

    return NextResponse.json({
      user: {
        id: userData?.id || '',
        email: userData?.email || email,
        nickname: userData?.nickname || '',
        points: userData?.points || 0,
        gems: userData?.gems || 0,
        emailVerified: userData?.email_verified ?? true,
        createdAt: userData?.created_at || new Date().toISOString(),
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
