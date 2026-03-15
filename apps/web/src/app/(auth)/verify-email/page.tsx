'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const verifyToken = useCallback(async () => {
    if (!token) return

    setStatus('verifying')
    try {
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.message || '인증에 실패했습니다')
      }
    } catch (error) {
      setStatus('error')
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }, [token])

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token, verifyToken])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (!email || resendLoading || cooldown > 0) return

    setResendLoading(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (response.status === 429 && data.remainingSeconds) {
        setCooldown(data.remainingSeconds)
      } else if (response.ok) {
        setCooldown(60)
      }

      setResendMessage(data.message)
    } catch (error) {
      setResendMessage('재전송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setResendLoading(false)
    }
  }

  // Token verification flow
  if (token) {
    return (
      <div className="text-center space-y-5">
        <h2 className="text-xl font-bold text-[#1F2937]">이메일 인증</h2>

        {status === 'verifying' && (
          <div className="py-8">
            <svg className="animate-spin h-8 w-8 text-[#145A46] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-[#6B7280] text-sm">이메일을 인증하는 중...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] mx-auto flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#145A46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="p-3 bg-[#F0F7F4] border border-[#C8E6C9] text-[#145A46] rounded-xl text-sm">
              {message}
            </div>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-[#145A46] text-white font-semibold text-sm rounded-xl hover:bg-[#0D4435] transition-colors"
            >
              로그인하러 가기
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {message}
            </div>
            {email && (
              <button
                onClick={handleResend}
                disabled={resendLoading || cooldown > 0}
                className="px-6 py-2.5 bg-[#145A46] text-white text-sm font-semibold rounded-xl hover:bg-[#0D4435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `${cooldown}초 후 재전송 가능` : '인증 메일 재전송'}
              </button>
            )}
            <div>
              <Link href="/login" className="text-sm text-[#145A46] font-semibold hover:underline">
                로그인 페이지로
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Email verification pending (after signup)
  return (
    <div className="text-center space-y-5">
      <h2 className="text-xl font-bold text-[#1F2937]">이메일 인증 필요</h2>

      <div className="py-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0F7F4] mx-auto flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#145A46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        <div>
          <p className="text-[#1F2937] text-sm">
            {email ? (
              <>
                <span className="font-semibold">{email}</span>
                <br />
                으로 인증 메일을 보냈습니다.
              </>
            ) : (
              '가입 시 입력한 이메일로 인증 메일을 보냈습니다.'
            )}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
            메일함을 확인하고 인증 링크를 클릭해주세요.
            <br />
            메일이 보이지 않으면 스팸함도 확인해주세요.
          </p>
        </div>

        {email && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0}
              className="px-6 py-2.5 bg-[#145A46] text-white text-sm font-semibold rounded-xl hover:bg-[#0D4435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {resendLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  전송 중...
                </>
              ) : cooldown > 0 ? (
                `${cooldown}초 후 재전송 가능`
              ) : (
                '인증 메일 재전송'
              )}
            </button>

            {resendMessage && (
              <p className="text-sm text-[#6B7280]">{resendMessage}</p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-[#9CA3AF]">
          이미 인증을 완료하셨나요?{' '}
          <Link href="/login" className="font-semibold text-[#145A46] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-8">
        <svg className="animate-spin h-8 w-8 text-[#145A46] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p className="text-[#6B7280] text-sm">로딩 중...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
