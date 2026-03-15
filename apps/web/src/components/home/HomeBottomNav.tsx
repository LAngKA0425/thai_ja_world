'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { t } from '@/lib/i18n'

const navItems = [
  {
    href: '/',
    labelKey: 'home.nav.home',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#145A46" stroke="#145A46" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22" fill="white"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/community',
    labelKey: 'home.nav.community',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#145A46" stroke="#145A46" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: '/local',
    labelKey: 'home.nav.local',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#145A46" stroke="#145A46" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    href: '/tips',
    labelKey: 'home.nav.tips',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#145A46" stroke="#145A46" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    href: '/my',
    labelKey: 'home.nav.my',
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#145A46" stroke="#145A46" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    iconInactive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export function HomeBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-safe-bottom">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
                  isActive ? 'text-[#145A46]' : 'text-[#9CA3AF]'
                }`}
              >
                {isActive ? item.iconActive : item.iconInactive}
                <span className={`text-[10px] font-semibold ${isActive ? 'text-[#145A46]' : 'text-[#9CA3AF]'}`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
