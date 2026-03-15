import crypto from 'crypto'

// ============================================
// Email Verification Token System
// ============================================
// - 토큰 생성: crypto.randomBytes (32 bytes hex)
// - 토큰 저장: SHA-256 해시로 저장 (평문 저장 금지)
// - 만료: 24시간
// - 재사용 불가: 사용 후 삭제
// - Dev mode: 콘솔에 인증 링크 출력
// ============================================

// Resend cooldown tracking (email -> last sent timestamp)
const resendCooldowns = new Map<string, number>()

const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function checkResendCooldown(email: string): { allowed: boolean; remainingSeconds: number } {
  const lastSent = resendCooldowns.get(email)
  const now = Date.now()

  if (lastSent && now - lastSent < RESEND_COOLDOWN_MS) {
    const remainingMs = RESEND_COOLDOWN_MS - (now - lastSent)
    return { allowed: false, remainingSeconds: Math.ceil(remainingMs / 1000) }
  }

  return { allowed: true, remainingSeconds: 0 }
}

export function recordResendCooldown(email: string): void {
  resendCooldowns.set(email, Date.now())
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    console.error('[Email] SITE_URL 환경변수가 설정되지 않았습니다 (fallback: NEXT_PUBLIC_SITE_URL)')
    return { success: false, error: 'SITE_URL 설정이 필요합니다' }
  }
  const baseUrl = siteUrl.replace(/\/$/, '')
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  const smtpHost = process.env.SMTP_HOST

  if (smtpHost && smtpHost !== '') {
    // Production: nodemailer SMTP 발송
    try {
      const nodemailer = await import('nodemailer')

      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"태국에 살자" <noreply@taeja.world>`,
        to: email,
        subject: '[태국에 살자] 이메일 인증을 완료해주세요',
        html: `
          <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937;">
            <div style="background:#145A46;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;font-size:20px;margin:0;">태국에 살자</h1>
            </div>
            <div style="background:#fff;padding:32px 24px;border:1px solid #E5E7EB;border-top:none;">
              <h2 style="font-size:18px;margin:0 0 16px;">이메일 인증을 완료해주세요</h2>
              <p style="font-size:14px;color:#6B7280;line-height:1.6;margin:0 0 24px;">
                아래 버튼을 클릭하면 이메일 인증이 완료됩니다.<br/>
                본인이 요청하지 않은 경우 이 메일을 무시해주세요.
              </p>
              <a href="${verificationUrl}" style="display:inline-block;background:#145A46;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
                이메일 인증하기
              </a>
              <p style="font-size:12px;color:#9CA3AF;margin:24px 0 0;line-height:1.5;">
                버튼이 작동하지 않으면 아래 링크를 복사해서 브라우저에 붙여넣으세요.<br/>
                <a href="${verificationUrl}" style="color:#145A46;word-break:break-all;">${verificationUrl}</a>
              </p>
              <p style="font-size:11px;color:#D1D5DB;margin:16px 0 0;">이 인증 링크는 24시간 동안 유효합니다.</p>
            </div>
            <div style="padding:16px;text-align:center;border-radius:0 0 12px 12px;background:#FAFAF8;border:1px solid #E5E7EB;border-top:none;">
              <p style="font-size:11px;color:#9CA3AF;margin:0;">© 2026 태국에 살자. All rights reserved.</p>
            </div>
          </div>
        `,
      })

      console.log(`[Email] Sent verification email to ${email}`)
      return { success: true }
    } catch (error) {
      console.error('[Email] Failed to send verification email:', error)
      return { success: false, error: '이메일 발송에 실패했습니다' }
    }
  }

  // Dev mode: 콘솔에 인증 링크 출력
  console.log('\n' + '='.repeat(60))
  console.log('[DEV] Email Verification')
  console.log('='.repeat(60))
  console.log(`To: ${email}`)
  console.log(`Subject: [태자월드] 이메일 인증을 완료해주세요`)
  console.log(`\nVerification URL:\n${verificationUrl}`)
  console.log(`\nToken: ${token}`)
  console.log('='.repeat(60) + '\n')

  return { success: true }
}
