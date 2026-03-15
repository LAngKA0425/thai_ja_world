'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { t } from '@/lib/i18n'

interface ProfileEditorProps {
  onClose?: () => void
}

const LOCALES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'th', label: 'ไทย' },
]

export function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user, updateProfile } = useAuthStore()
  const { items: inventoryItems } = useInventoryStore()
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '😊')
  const [selectedLocale, setSelectedLocale] = useState('ko')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const costumes = inventoryItems.filter((item) => item.category === 'costume')

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError(t('profile.nicknameRequired'))
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await updateProfile({
        nickname: nickname.trim(),
        avatar: selectedAvatar,
      })
      alert(t('profile.saveSuccess'))
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Nickname */}
      <div>
        <label className="block font-bold text-gray-800 mb-2">{t('profile.nickname')}</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 20))}
          maxLength={20}
          className="cute-input w-full"
          placeholder={t('profile.nicknamePlaceholder')}
        />
        <p className="text-xs text-gray-500 mt-1">{nickname.length} / 20</p>
      </div>

      {/* Avatar selector */}
      <div>
        <label className="block font-bold text-gray-800 mb-3">{t('profile.avatar')}</label>
        <div className="grid grid-cols-4 gap-3">
          {/* Default avatars */}
          {['😊', '🥰', '😘', '🤔', '🥳', '😎', '🤗', '👻'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedAvatar(emoji)}
              className={`text-3xl p-3 rounded-2xl transition-all ${
                selectedAvatar === emoji
                  ? 'cute-card border-4 border-pink-400'
                  : 'cute-card hover:shadow-lg'
              }`}
            >
              {emoji}
            </button>
          ))}

          {/* Costume avatars */}
          {costumes.slice(0, 8).map((costume) => (
            <button
              key={costume.id}
              onClick={() => setSelectedAvatar(costume.id)}
              className={`text-3xl p-3 rounded-2xl transition-all ${
                selectedAvatar === costume.id
                  ? 'cute-card border-4 border-pink-400'
                  : 'cute-card hover:shadow-lg'
              }`}
              title={costume.name}
            >
              👔
            </button>
          ))}
        </div>
      </div>

      {/* Locale selector */}
      <div>
        <label className="block font-bold text-gray-800 mb-2">{t('profile.language')}</label>
        <div className="space-y-2">
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              onClick={() => setSelectedLocale(locale.code)}
              className={`w-full p-3 rounded-2xl text-left font-bold transition-all ${
                selectedLocale === locale.code
                  ? 'cute-button'
                  : 'cute-card hover:shadow-lg'
              }`}
            >
              {locale.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full cute-button py-3 font-bold disabled:opacity-50"
      >
        {isLoading ? t('common.saving') : t('common.save')}
      </button>
    </div>
  )
}
