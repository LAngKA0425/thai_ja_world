// Cloudflare Turnstile server-side verification
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileVerifyResult {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // TURNSTILE_SECRET_KEY가 없으면 검증 스킵 (1차 출시 허용)
  if (!secretKey || secretKey === '' || secretKey === 'dev-skip') {
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY 미설정 - CAPTCHA 검증을 건너뜁니다')
    return { success: true }
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA 인증이 필요합니다' }
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (remoteIp) {
      formData.append('remoteip', remoteIp)
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })

    const result: TurnstileVerifyResult = await response.json()

    if (!result.success) {
      console.warn('[Turnstile] Verification failed:', result['error-codes'])
      return { success: false, error: 'CAPTCHA 인증에 실패했습니다. 다시 시도해주세요.' }
    }

    return { success: true }
  } catch (error) {
    console.error('[Turnstile] Verification error:', error)
    // Fail open in case of network error to Cloudflare (optional policy)
    return { success: false, error: 'CAPTCHA 검증 중 오류가 발생했습니다' }
  }
}
