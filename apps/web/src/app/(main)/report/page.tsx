'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useModeration } from '@/hooks/useModeration'
import { ReportForm } from '@/components/moderation/ReportForm'
import { t } from '@/lib/i18n'

export default function ReportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const targetUserId = searchParams.get('userId')
  const targetUserName = searchParams.get('userName')
  const { report, loading, error } = useModeration()

  const handleReport = async (reason: string, description: string) => {
    if (!targetUserId) {
      alert(t('validation.reportTargetMissing'))
      return
    }

    try {
      await report(targetUserId, reason, description)
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (err) {
      console.error('Report failed:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <h2 className="text-2xl font-bold mb-6">{t('moderation.reportUser')}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl font-bold text-center">
          ❌ {error}
        </div>
      )}

      <ReportForm
        targetUserName={targetUserName || undefined}
        onSubmit={handleReport}
        isLoading={loading}
      />
    </div>
  )
}
