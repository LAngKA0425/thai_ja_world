import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@/lib/captcha'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email-verification'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { getBackendInternalSecret, getBackendInternalUrl } from '@/lib/server-env'

const BACKEND_URL = getBackendInternalUrl()
const INTERNAL_SECRET = getBackendInternalSecret()

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`signup:${ip}`, RATE_LIMITS.signup)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: '너무 많은 가입 시도입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password, nickname, turnstileToken, honeypot } = body

    // Honeypot check (hidden field - bots fill this)
    if (honeypot) {
      // Silently reject bot submissions
      return NextResponse.json(
        { message: '가입이 완료되었습니다. 이메일을 확인해주세요.' },
        { status: 201 }
      )
    }

    // Production: Turnstile 환경변수 체크 (미설정 시 경고만 출력, 차단하지 않음)
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.TURNSTILE_SECRET_KEY || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
        console.warn('[Signup] Turnstile 환경변수가 설정되지 않았습니다 - CAPTCHA 검증을 건너뜁니다')
      }
    }

    // Turnstile CAPTCHA verification
    const captchaResult = await verifyTurnstileToken(turnstileToken || '', ip)
    if (!captchaResult.success) {
      return NextResponse.json(
        { message: captchaResult.error || 'CAPTCHA 인증에 실패했습니다' },
        { status: 400 }
      )
    }

    // Validation
    if (!email || !password || !nickname) {
      return NextResponse.json(
        { message: '이메일, 비밀번호, 닉네임이 필요합니다' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json(
        { message: '닉네임은 2자 이상 20자 이하여야 합니다' },
        { status: 400 }
      )
    }

    // Call FastAPI backend to create user in PostgreSQL
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      // Forward backend error message
      const msg = backendData?.detail?.message || backendData?.detail || '회원가입에 실패했습니다'
      return NextResponse.json(
        { message: typeof msg === 'string' ? msg : '회원가입에 실패했습니다' },
        { status: backendResponse.status }
      )
    }

    // User created in PostgreSQL successfully
    const userId = backendData.id

    // Generate email verification token and send
    const verificationToken = generateVerificationToken()

    const tokenResponse = await fetch(`${BACKEND_URL}/api/v1/auth/create-email-verification-token-internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        email,
        token: verificationToken,
        internal_secret: INTERNAL_SECRET,
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('Failed to persist verification token:', tokenError)
    }

    const sendResult = tokenResponse.ok
      ? await sendVerificationEmail(email, verificationToken)
      : { success: false, error: '인증 토큰 저장에 실패했습니다' }

    if (!sendResult.success) {
      console.error('Failed to send verification email:', sendResult.error)
      // User is created but email failed - still return success
      // User can use resend later
    }

    return NextResponse.json(
      {
        user: {
          id: userId,
          email: backendData.email,
          nickname: backendData.nickname,
        },
        requiresVerification: true,
        message: '가입이 완료되었습니다. 이메일 인증 후 로그인할 수 있습니다.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
