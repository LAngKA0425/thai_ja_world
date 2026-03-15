'use client'

import { useState } from 'react'
import { FriendRequest } from '@/stores/friendship-store'
import { t } from '@/lib/i18n'

interface FriendRequestCardProps {
  request: FriendRequest
  type: 'received' | 'sent'
  onAccept?: (requestId: string) => Promise<void>
  onReject?: (requestId: string) => Promise<void>
  onCancel?: (requestId: string) => Promise<void>
}

export function FriendRequestCard({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    if (!onAccept) return
    try {
      setIsLoading(true)
      await onAccept(request.id)
    } catch (error) {
      console.error('Failed to accept request:', error)
      alert(t('friendship.acceptRequestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    try {
      setIsLoading(true)
      await onReject(request.id)
    } catch (error) {
      console.error('Failed to reject request:', error)
      alert(t('friendship.rejectRequestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!onCancel) return
    try {
      setIsLoading(true)
      await onCancel(request.id)
    } catch (error) {
      console.error('Failed to cancel request:', error)
      alert(t('friendship.cancelRequestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const createdDate = new Date(request.createdAt)
  const dateStr = createdDate.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="cute-card flex items-center justify-between p-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-4xl">{request.fromAvatar || '😊'}</div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{request.fromNickname}</p>
          <p className="text-xs text-gray-500">{dateStr}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {type === 'received' ? (
          <>
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-bold rounded-2xl cute-button disabled:opacity-50"
            >
              {t('friendship.acceptRequest')}
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-bold rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {t('friendship.rejectRequest')}
            </button>
          </>
        ) : (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-bold rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </div>
  )
}
