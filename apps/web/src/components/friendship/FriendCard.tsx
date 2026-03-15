'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Friend } from '@/stores/friendship-store'
import { t } from '@/lib/i18n'

interface FriendCardProps {
  friend: Friend
  onDelete?: (friendId: string) => Promise<void>
}

export function FriendCard({ friend, onDelete }: FriendCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleVisit = () => {
    router.push(`/minihome/${friend.userId}`)
  }

  const handleDelete = async () => {
    if (!onDelete || !window.confirm(t('friendship.removeFriend'))) return

    try {
      setIsLoading(true)
      await onDelete(friend.id)
    } catch (error) {
      console.error('Failed to delete friend:', error)
      alert(t('friendship.removeFriendFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="cute-card flex items-center justify-between p-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-4xl">{friend.avatar || '😊'}</div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{friend.nickname}</p>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            <p className="text-xs text-gray-500">{t('minihome.online')}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleVisit}
          className="px-3 py-2 text-sm font-bold rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 text-white hover:opacity-90 transition-opacity"
        >
          {t('minihome.title')}
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-3 py-2 text-sm font-bold rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}
