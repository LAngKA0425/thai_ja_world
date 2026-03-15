'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { t } from '@/lib/i18n'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.replace(`/minihome/${user.id}`)
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <div className="text-center py-8">
        <div className="loading-spinner mx-auto mb-4" />
        <p className="text-gray-600">{t('home.redirecting')}</p>
      </div>
    </div>
  )
}
