'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'
import { HomeHeader } from '@/components/home/HomeHeader'
import { t } from '@/lib/i18n'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true)
      if (!isAuthenticated) {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="loading-spinner mb-4 mx-auto" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      <HomeHeader />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <HomeBottomNav />
    </div>
  )
}
