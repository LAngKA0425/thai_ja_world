'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { t } from '@/lib/i18n'

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const navItems = [
    { href: '/plaza', label: t('nav.plaza'), icon: '🏛️' },
    { href: '/shop', label: t('nav.shop'), icon: '🛍️' },
    { href: user ? `/minihome/${user.id}` : '/home', label: t('nav.home'), icon: '🏠' },
    { href: '/friends', label: t('nav.friends'), icon: '👥' },
    { href: '/menu', label: t('nav.menu'), icon: '≡' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-pink-100 pb-safe-bottom">
      <div className="max-w-2xl mx-auto px-0">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = item.label === t('nav.home')
              ? pathname.startsWith('/minihome') || pathname === '/home'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex-1 py-3 px-2 text-center flex flex-col items-center gap-1 border-t-2 transition-all ${
                  isActive
                    ? 'border-t-primary text-primary bg-pink-50'
                    : 'border-t-transparent text-gray-600 hover:text-primary'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
