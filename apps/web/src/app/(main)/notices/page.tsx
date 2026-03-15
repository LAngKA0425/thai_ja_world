'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { t } from '@/lib/i18n'

interface Notice {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function NoticesPage() {
  const { token } = useAuthStore()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchNotices = async () => {
      if (!token) return

      try {
        setLoading(true)
        const response = await fetch(`/api/admin/notices?page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setNotices(data.notices || [])
        }
      } catch (error) {
        console.error('Failed to fetch notices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [token, page])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">{t('menu.notices')}</h2>
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <h2 className="text-2xl font-bold mb-6">{t('menu.notices')}</h2>

      {notices.length > 0 ? (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="cute-card p-4">
              <button
                onClick={() =>
                  setExpandedId(expandedId === notice.id ? null : notice.id)
                }
                className="w-full text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className="text-xl text-pink-600">
                    {expandedId === notice.id ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {expandedId === notice.id && (
                <div className="mt-4 pt-4 border-t-2 border-pink-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="cute-card text-center py-8">
          <p className="text-gray-600">{t('notices.noNotices')}</p>
        </div>
      )}

      {/* Pagination */}
      {notices.length > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-2xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            {t('notices.previous')}
          </button>
          <span className="px-4 py-2 font-bold text-gray-800">{page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-2xl font-bold cute-button"
          >
            {t('notices.next')}
          </button>
        </div>
      )}
    </div>
  )
}
