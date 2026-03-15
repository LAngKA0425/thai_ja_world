'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { t } from '@/lib/i18n'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [visitorCount] = useState(0)

  const handleLogout = () => {
    if (window.confirm(t('common.confirmLogout'))) {
      logout()
      router.push('/login')
    }
  }

  const handleVisitMinihome = () => {
    if (user) {
      router.push(`/minihome/${user.id}`)
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-gray-600">{t('common.loginRequired')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <h2 className="text-2xl font-bold mb-6">{t('profile.title')}</h2>

      {/* Profile card */}
      {!isEditing && (
        <div className="cute-card mb-6 p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{user.avatar || '😊'}</div>
            <h3 className="text-2xl font-bold text-gray-800">{user.nickname}</h3>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 border-t-2 border-pink-100 pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">👥</p>
              <p className="text-lg font-bold text-gray-800">0</p>
              <p className="text-xs text-gray-500">{t('friendship.friends')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">👁️</p>
              <p className="text-lg font-bold text-gray-800">{visitorCount}</p>
              <p className="text-xs text-gray-500">{t('minihome.visitors')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">📅</p>
              <p className="text-lg font-bold text-gray-800">1</p>
              <p className="text-xs text-gray-500">{t('profile.joinDays')}</p>
            </div>
          </div>

          {/* Currency */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl p-4">
            <div className="text-center">
              <p className="text-2xl mb-1">💎</p>
              <p className="text-lg font-bold text-gray-800">{user.gems}</p>
              <p className="text-xs text-gray-500">{t('shop.stylePoints')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1">⭐</p>
              <p className="text-lg font-bold text-gray-800">{user.points}</p>
              <p className="text-xs text-gray-500">{t('shop.activityScore')}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleVisitMinihome}
              className="flex-1 py-3 rounded-2xl font-bold cute-button"
            >
              {t('minihome.myMinihome')}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-3 rounded-2xl font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
            >
              {t('common.edit')}
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            {t('menu.logout')}
          </button>
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="cute-card p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{t('profile.editTitle')}</h3>
          <ProfileEditor onClose={() => setIsEditing(false)} />
          <button
            onClick={() => setIsEditing(false)}
            className="w-full mt-6 py-2 rounded-2xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}

      {/* Account info */}
      <div className="cute-card p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t('menu.account')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('profile.email')}:</span>
            <span className="text-gray-800 font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('minihome.joinDate')}:</span>
            <span className="text-gray-800 font-bold">
              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
