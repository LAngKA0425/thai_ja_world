'use client'

import { useState, useEffect } from 'react'

interface BroadcastComposeProps {
  type: 'NORMAL' | 'PREMIUM'
  onSend: (message: string) => Promise<void>
  cooldownRemaining: number
  isLoading: boolean
  selectedItemId?: string
}

const MAX_LENGTHS = {
  NORMAL: 50,
  PREMIUM: 100,
}

export function BroadcastCompose({
  type,
  onSend,
  cooldownRemaining,
  isLoading,
  selectedItemId,
}: BroadcastComposeProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const maxLength = MAX_LENGTHS[type]

  const handleSend = async () => {
    if (!message.trim() || sending || cooldownRemaining > 0) return

    try {
      setSending(true)
      await onSend(message)
      setMessage('')
    } finally {
      setSending(false)
    }
  }

  const isDisabled =
    !message.trim() ||
    sending ||
    isLoading ||
    cooldownRemaining > 0 ||
    message.length > maxLength

  return (
    <div className="cute-card p-4 space-y-4">
      <div>
        <h3 className="font-bold text-gray-800 mb-2">메시지 입력</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          placeholder={`${type === 'NORMAL' ? '최대 50글자' : '최대 100글자'}로 메시지를 입력하세요`}
          className="cute-input w-full h-24 resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {message.length} / {maxLength}
          </span>
          <span className="text-xs font-bold text-pink-600">
            {type === 'NORMAL' ? '일반' : '프리미엄'}
          </span>
        </div>
      </div>

      {/* Preview */}
      {message && (
        <div className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-2xl p-3">
          <p className="text-xs text-gray-600 mb-2">미리보기:</p>
          <div className="cute-card p-3 text-center">
            <p className="font-bold text-sm">{message}</p>
            {selectedItemId && (
              <p className="text-xs text-gray-500 mt-2">📢 확성기 사용</p>
            )}
          </div>
        </div>
      )}

      {/* Cooldown timer */}
      {cooldownRemaining > 0 && (
        <div className="text-center p-3 bg-yellow-100 rounded-2xl">
          <p className="font-bold text-gray-800">
            ⏱️ {cooldownRemaining}초 후에 다시 방송할 수 있습니다
          </p>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={isDisabled}
        className="w-full cute-button py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {sending ? '전송 중...' : '방송하기'}
      </button>
    </div>
  )
}
