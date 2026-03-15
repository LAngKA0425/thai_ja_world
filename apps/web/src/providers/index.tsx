'use client'

import { ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { setLocale } from '@/lib/i18n'

export function Providers({ children }: { children: ReactNode }) {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thai_ja_locale')
      if (saved === 'ko' || saved === 'en' || saved === 'th') {
        setLocale(saved)
      }
    }
  }, [])

  return (
    <>
      {children}
    </>
  )
}
