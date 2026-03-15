'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import { t } from '@/lib/i18n'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    agreeTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password))
  }, [formData.password])

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.passwordTooShort')
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch')
    }

    if (!formData.nickname) {
      newErrors.nickname = t('validation.nicknameRequired')
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = t('validation.nicknameTooShort')
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = t('validation.nicknameTooLong')
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = t('validation.agreeTermsRequired')
    }

    if (!turnstileToken) {
      newErrors.captcha = t('validation.captchaRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    try {
      const result = await signup(formData.email, formData.password, formData.nickname, turnstileToken)

      if (result?.requiresVerification) {
        // 이메일 인증 대기 페이지로 이동
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        router.push('/plaza')
      }
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : t('auth.signupFailed')
      )
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-400'
    if (passwordStrength <= 2) return 'bg-orange-400'
    if (passwordStrength <= 3) return 'bg-yellow-400'
    return 'bg-[#145A46]'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-[#1F2937]">
          {t('auth.signup')}
        </h2>
        <p className="text-sm text-[#9CA3AF] mt-1">{t('auth.signupWelcome')}</p>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} bg-[#FAFAF8] text-[#1F2937] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#145A46]/20 focus:border-[#145A46] transition-colors`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {t('auth.nickname')} <span className="text-[#9CA3AF] font-normal">({formData.nickname.length}/20)</span>
        </label>
        <input
          id="nickname"
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          placeholder={t('auth.nicknamePlaceholder')}
          className={`w-full px-4 py-3 rounded-xl border ${errors.nickname ? 'border-red-400' : 'border-gray-200'} bg-[#FAFAF8] text-[#1F2937] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#145A46]/20 focus:border-[#145A46] transition-colors`}
          disabled={isLoading}
          maxLength={20}
        />
        {errors.nickname && (
          <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('auth.passwordMinChars')}
          className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-400' : 'border-gray-200'} bg-[#FAFAF8] text-[#1F2937] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#145A46]/20 focus:border-[#145A46] transition-colors`}
          disabled={isLoading}
        />
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full ${
                    i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#9CA3AF]">
              {passwordStrength <= 1 && t('auth.passwordStrength.weak')}
              {passwordStrength === 2 && t('auth.passwordStrength.fair')}
              {passwordStrength === 3 && t('auth.passwordStrength.good')}
              {passwordStrength === 4 && t('auth.passwordStrength.strong')}
              {passwordStrength >= 5 && t('auth.passwordStrength.veryStrong')}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {t('auth.confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} bg-[#FAFAF8] text-[#1F2937] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#145A46]/20 focus:border-[#145A46] transition-colors`}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Honeypot field - hidden from users, bots fill it */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="honeypot"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Turnstile CAPTCHA */}
      <div>
        <TurnstileWidget
          onVerify={handleTurnstileVerify}
          onExpire={() => setTurnstileToken('')}
          onError={() => setTurnstileToken('')}
        />
        {errors.captcha && (
          <p className="text-red-500 text-xs mt-1 text-center">{errors.captcha}</p>
        )}
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input
          id="agreeTerms"
          type="checkbox"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#145A46] focus:ring-[#145A46]"
          disabled={isLoading}
        />
        <label htmlFor="agreeTerms" className="text-sm text-[#6B7280]">
          {t('auth.terms')}
        </label>
      </div>
      {errors.agreeTerms && (
        <p className="text-red-500 text-xs">{errors.agreeTerms}</p>
      )}

      <button
        type="submit"
        className="w-full py-3 bg-[#145A46] text-white font-semibold text-[15px] rounded-xl hover:bg-[#0D4435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {t('auth.signupLoading')}
          </>
        ) : (
          t('auth.signupSubmit')
        )}
      </button>

      <div className="text-center text-sm text-[#6B7280] pt-1">
        <p>
          {t('auth.alreadyMember')}{' '}
          <Link
            href="/login"
            className="font-semibold text-[#145A46] hover:underline"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </form>
  )
}
