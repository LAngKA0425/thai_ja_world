'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { t, getLocale, setLocale } from '@/lib/i18n'

export default function MenuPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    if (window.confirm(t('common.confirmLogout'))) {
      logout()
      router.push('/login')
    }
  }

  const menuSections = [
    {
      title: t('menu.myInfo'),
      items: [
        {
          icon: '👤',
          label: t('menu.profile'),
          description: t('menu.profileDescription'),
          href: '/profile',
        },
        {
          icon: '🎒',
          label: t('menu.inventory'),
          description: t('menu.inventoryDescription'),
          href: '/inventory',
        },
      ],
    },
    {
      title: t('menu.currency'),
      items: [
        {
          icon: '💰',
          label: t('menu.chargeTitle'),
          description: t('menu.chargeDescription'),
          action: 'charge',
        },
      ],
    },
    {
      title: t('menu.community'),
      items: [
        {
          icon: '📢',
          label: t('menu.notices'),
          description: t('menu.noticesDescription'),
          href: '/notices',
        },
        {
          icon: '💬',
          label: t('menu.support'),
          description: t('menu.supportDescription'),
          action: 'support',
        },
      ],
    },
    {
      title: t('menu.settings'),
      items: [
        {
          icon: '⚙️',
          label: t('menu.settings'),
          description: t('menu.settingsDescription'),
          action: 'settings',
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h2 className="text-2xl font-bold mb-6">{t('menu.title')}</h2>

      {/* User info */}
      {user && (
        <div className="cute-card mb-6 p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{user.avatar || '😊'}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{user.nickname}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">💎</p>
                  <p className="text-xs text-gray-600">{user.gems}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">⭐</p>
                  <p className="text-xs text-gray-600">{user.points}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu sections */}
      {menuSections.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3 px-2">{section.title}</h3>
          <div className="space-y-3">
            {section.items.map((item, idx) => {
              const itemKey = `${section.title}-${idx}`
              const content = (
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <span className="text-xl text-[#145A46]">›</span>
                </div>
              )

              if (item.href) {
                return (
                  <Link
                    key={itemKey}
                    href={item.href}
                    className="w-full cute-card p-4 block hover:shadow-lg transition-shadow"
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <button
                  key={itemKey}
                  onClick={() => {
                    if (item.action === 'charge') {
                      alert(t('menu.chargeAlert'))
                    } else if (item.action === 'support') {
                      alert(t('menu.supportAlert'))
                    } else if (item.action === 'settings') {
                      alert(t('menu.settingsAlert'))
                    }
                  }}
                  className="w-full cute-card p-4 text-left hover:shadow-lg transition-shadow"
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Language section */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-3 px-2">{t('settings.language')}</h3>
        <div className="cute-card p-4">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-3xl">🌐</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{t('settings.language')}</p>
              <p className="text-sm text-gray-500">{t('settings.languageDescription')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {([
              { locale: 'ko' as const, label: '한국어' },
              { locale: 'th' as const, label: 'ภาษาไทย' },
              { locale: 'en' as const, label: 'English' },
            ]).map((lang) => (
              <button
                key={lang.locale}
                onClick={() => {
                  setLocale(lang.locale)
                  localStorage.setItem('thai_ja_locale', lang.locale)
                  window.location.reload()
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  getLocale() === lang.locale
                    ? 'bg-[#145A46] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account section */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-3 px-2">{t('menu.account')}</h3>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full cute-card p-4 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🚪</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{t('menu.logout')}</p>
                <p className="text-sm text-gray-500">{t('menu.logoutDescription')}</p>
              </div>
              <span className="text-xl text-[#145A46]">›</span>
            </div>
          </button>

          <button
            onClick={() => alert(t('menu.deleteAccountAlert'))}
            className="w-full cute-card p-4 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🗑️</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{t('menu.deleteAccount')}</p>
                <p className="text-sm text-gray-500">{t('menu.deleteAccountDescription')}</p>
              </div>
              <span className="text-xl text-[#145A46]">›</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pb-6 border-t-2 border-gray-100 pt-6">
        <p className="font-bold mb-1">{t('app.title')} v0.1.0</p>
        <p>© 2024 thai_ja_world</p>
        <p className="mt-3 text-gray-500">Made with 💕 for fun</p>
      </div>
    </div>
  )
}
