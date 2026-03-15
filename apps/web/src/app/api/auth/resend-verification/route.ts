import { NextRequest, NextResponse } from 'next/server'
import {
  generateVerificationToken,
  sendVerificationEmail,
  checkResendCooldown,
  recordResendCooldown,
} from '@/lib/email-verification'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { getBackendInternalSecret, getBackendInternalUrl } from '@/lib/server-env'

const BACKEND_URL = getBackendInternalUrl()
const INTERNAL_SECRET = getBackendInternalSecret()

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`resend-verification:${ip}`, RATE_LIMITS.resendVerification)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { message: '이메일이 필요합니다' },
        { status: 400 }
      )
    }

    // Find user via FastAPI backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/user-by-email-internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, internal_secret: INTERNAL_SECRET }),
    })

    if (!backendResponse.ok) {
      // Don't reveal if email exists or not
      return NextResponse.json(
        { message: '인증 메일을 전송했습니다. 메일함을 확인해주세요.' },
        { status: 200 }
      )
    }

    const backendData = await backendResponse.json()

    if (!backendData.found) {
      // Don't reveal if email exists or not
      return NextResponse.json(
        { message: '인증 메일을 전송했습니다. 메일함을 확인해주세요.' },
        { status: 200 }
      )
    }

    if (backendData.user.email_verified) {
      return NextResponse.json(
        { message: '이미 인증이 완료된 이메일입니다. 로그인해주세요.' },
        { status: 200 }
      )
    }

    // Check cooldown
    const cooldown = checkResendCooldown(email)
    if (!cooldown.allowed) {
      return NextResponse.json(
        { message: `${cooldown.remainingSeconds}초 후에 다시 시도해주세요.`, remainingSeconds: cooldown.remainingSeconds },
        { status: 429 }
      )
    }

    // Generate new token and send email
    const token = generateVerificationToken()

    const tokenResponse = await fetch(`${BACKEND_URL}/api/v1/auth/create-email-verification-token-internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: backendData.user.id,
        email,
        token,
        internal_secret: INTERNAL_SECRET,
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('Failed to persist resend verification token:', tokenError)
      return NextResponse.json(
        { message: '인증 토큰 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    const sendResult = await sendVerificationEmail(email, token)

    if (!sendResult.success) {
      return NextResponse.json(
        { message: sendResult.error || '이메일 발송에 실패했습니다' },
        { status: 500 }
      )
    }

    recordResendCooldown(email)

    return NextResponse.json(
      { message: '인증 메일을 전송했습니다. 메일함을 확인해주세요.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
