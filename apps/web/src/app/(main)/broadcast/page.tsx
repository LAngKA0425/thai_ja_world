'use client'

import { useState } from 'react'
import { useBroadcast } from '@/hooks/useBroadcast'
import { BroadcastItemSelector } from '@/components/broadcast/BroadcastItemSelector'
import { BroadcastCompose } from '@/components/broadcast/BroadcastCompose'
import { t } from '@/lib/i18n'

export default function BroadcastPage() {
  const {
    broadcastItems,
    history,
    cooldownRemaining,
    loading,
    error,
    send,
  } = useBroadcast()
  const [broadcastType, setBroadcastType] = useState<'NORMAL' | 'PREMIUM'>('NORMAL')
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  const handleSend = async (message: string) => {
    try {
      setSendError(null)
      await send(message, broadcastType, selectedItemId)
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 2000)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : t('broadcast.sendError'))
      setTimeout(() => setSendError(null), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <h2 className="text-2xl font-bold mb-6">{t('broadcast.title')}</h2>

      {/* Error/Success messages */}
      {sendSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-2xl font-bold text-center animate-bounce-cute">
          🎉 {t('broadcast.sendSuccess')}
        </div>
      )}

      {(sendError || error) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl font-bold text-center">
          ❌ {sendError || error}
        </div>
      )}

      {/* Broadcast type selector */}
      <div className="cute-card p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">{t('broadcast.typeSelector')}</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setBroadcastType('NORMAL')}
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
              broadcastType === 'NORMAL'
                ? 'cute-button'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <p>📢 {t('broadcast.normalBroadcast')}</p>
            <p className="text-xs text-gray-600 mt-1">{t('broadcast.normalLimit')}</p>
          </button>
          <button
            onClick={() => setBroadcastType('PREMIUM')}
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
              broadcastType === 'PREMIUM'
                ? 'cute-button'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <p>✨ {t('broadcast.premiumBroadcast')}</p>
            <p className="text-xs text-gray-600 mt-1">{t('broadcast.premiumLimit')}</p>
          </button>
        </div>
      </div>

      {/* Broadcast item selector */}
      <BroadcastItemSelector
        items={broadcastItems}
        selectedItemId={selectedItemId}
        onSelect={setSelectedItemId}
      />

      {/* Compose */}
      <BroadcastCompose
        type={broadcastType}
        onSend={handleSend}
        cooldownRemaining={cooldownRemaining}
        isLoading={loading}
        selectedItemId={selectedItemId}
      />

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-800 mb-4">{t('broadcast.recentHistory')}</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="cute-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-gray-800">{item.message}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700 font-bold">
                        {item.type === 'NORMAL' ? t('broadcast.normalBroadcast') : t('broadcast.premiumBroadcast')}
                      </span>
                      {item.itemId && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                          📢 {t('inventory.broadcast')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="mt-8 cute-card text-center py-8 text-gray-500">
          {t('broadcast.noHistory')}
        </div>
      )}
    </div>
  )
}
