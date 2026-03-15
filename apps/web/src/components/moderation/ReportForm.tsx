'use client'

import { useState } from 'react'
import { t } from '@/lib/i18n'

const REPORT_REASONS = [
  { id: 'inappropriate_behavior', label: t('moderation.reasons.inappropriateBehavior') },
  { id: 'harassment', label: t('moderation.reasons.harassment') },
  { id: 'spam', label: t('moderation.reasons.spam') },
  { id: 'scam', label: t('moderation.reasons.scam') },
  { id: 'inappropriate_content', label: t('moderation.reasons.inappropriateContent') },
  { id: 'other', label: t('moderation.reasons.other') },
]

interface ReportFormProps {
  targetUserName?: string
  onSubmit: (reason: string, description: string) => Promise<void>
  isLoading?: boolean
}

export function ReportForm({
  targetUserName,
  onSubmit,
  isLoading = false,
}: ReportFormProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason || !description.trim()) {
      alert(t('validation.reasonAndDescriptionRequired'))
      return
    }

    try {
      await onSubmit(selectedReason, description)
      setSubmitted(true)
      setTimeout(() => {
        setSelectedReason('')
        setDescription('')
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Report submission failed:', error)
    }
  }

  if (submitted) {
    return (
      <div className="cute-card text-center py-8">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-xl font-bold text-gray-800 mb-2">{t('moderation.reportSuccess')}</p>
        <p className="text-sm text-gray-600">
          {t('moderation.reportWillBeReviewed')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Target user */}
      {targetUserName && (
        <div className="cute-card p-4 bg-emerald-50">
          <p className="text-sm text-gray-600 mb-1">{t('moderation.reportTarget')}</p>
          <p className="font-bold text-gray-800">{targetUserName}</p>
        </div>
      )}

      {/* Report reason */}
      <div>
        <label className="block font-bold text-gray-800 mb-3">{t('moderation.reason')}</label>
        <div className="space-y-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`w-full p-3 rounded-2xl text-left font-bold transition-all ${
                selectedReason === reason.id
                  ? 'cute-button'
                  : 'cute-card hover:shadow-lg'
              }`}
            >
              {reason.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block font-bold text-gray-800 mb-2">{t('moderation.description')}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          placeholder={t('moderation.descriptionPlaceholder')}
          maxLength={500}
          className="cute-input w-full h-24 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{description.length} / 500</p>
      </div>

      {/* Evidence upload placeholder */}
      <div>
        <label className="block font-bold text-gray-800 mb-2">{t('moderation.evidenceImage')}</label>
        <button className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#145A46] transition-colors">
          <p className="text-3xl mb-2">📸</p>
          <p className="text-sm font-bold text-gray-700">{t('moderation.selectImage')}</p>
          <p className="text-xs text-gray-500">{t('moderation.evidenceDescription')}</p>
        </button>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !selectedReason || !description.trim()}
        className="w-full cute-button py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('common.loading') : t('moderation.report')}
      </button>

      {/* Info */}
      <div className="cute-card p-4 bg-blue-50">
        <p className="text-xs text-blue-700 leading-relaxed">
          ℹ️ {t('moderation.reportNotice')}
        </p>
      </div>
    </div>
  )
}
