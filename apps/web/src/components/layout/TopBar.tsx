'use client'

import { t } from '@/lib/i18n'

interface TopBarProps {
  user: any | null
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-pink-100 shadow-sm pt-safe-top">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-transparent bg-clip-text gradient-pink-yellow">
            {t('app.title')}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xl">💎</span>
            <span className="font-bold text-primary">{user?.gems || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-yellow-600">{user?.points || 0}</span>
          </div>
          <button className="text-xl hover:scale-110 transition-transform">
            🔔
          </button>
          <button className="text-xl hover:scale-110 transition-transform">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  )
}
