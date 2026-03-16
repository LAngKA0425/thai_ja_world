'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { t } from '@/lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [verificationNeeded, setVerificationNeeded] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setVerificationNeeded(null)

    if (!validateForm()) {
      return
    }

    try {
      await login(formData.email, formData.password)
      router.push('/')
    } catch (error: any) {
      if (error.requiresVerification) {
        setVerificationNeeded(error.email || formData.email)
        setApiError(error.message || t('auth.emailVerificationRequired'))
      } else {
        setApiError(
          error instanceof Error ? error.message : t('auth.loginFailed')
        )
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-[#1F2937]">
          {t('auth.login')}
        </h2>
        <p className="text-sm text-[#9CA3AF] mt-1">{t('auth.loginWelcome')}</p>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
          {verificationNeeded && (
            <div className="mt-2 pt-2 border-t border-red-100">
              <Link
                href={`/verify-email?email=${encodeURIComponent(verificationNeeded)}`}
                className="inline-flex items-center gap-1 text-[#145A46] font-semibold hover:underline text-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {t('auth.resendVerification')}
              </Link>
            </div>
          )}
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
        <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('auth.passwordPlaceholder')}
          className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-400' : 'border-gray-200'} bg-[#FAFAF8] text-[#1F2937] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#145A46]/20 focus:border-[#145A46] transition-colors`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-[#145A46] text-white font-semibold text-[15px] rounded-xl hover:bg-[#0D4435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {t('auth.loginLoading')}
          </>
        ) : (
          t('auth.login')
        )}
      </button>

      <div className="text-center text-sm text-[#6B7280] pt-1">
        <p>
          {t('auth.notMember')}{' '}
          <Link
            href="/signup"
            className="font-semibold text-[#145A46] hover:underline"
          >
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </form>
  )
}
