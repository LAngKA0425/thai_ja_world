'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { t } from '@/lib/i18n'

export function HomeHeader() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe-top">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#145A46] flex items-center justify-center">
            <span className="text-white font-black text-sm">태</span>
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] tracking-tight">
            <span className="text-[#145A46] font-black text-xl">태</span>
            <span className="text-[#1F2937]">국에</span>
            {' '}
            <span className="text-[#145A46] font-black text-xl">살</span>
            <span className="text-[#1F2937]">자</span>
          </h1>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          {/* Notification */}
          <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#F2994A] rounded-full"></span>
          </button>
          {/* Profile / Login */}
          {isAuthenticated ? (
            <Link href={user ? `/minihome/${user.id}` : '/my'} className="w-9 h-9 rounded-full bg-[#145A46] flex items-center justify-center text-white text-sm font-bold">
              {user?.nickname?.charAt(0) || 'U'}
            </Link>
          ) : (
            <Link href="/login" className="px-3.5 py-1.5 bg-[#145A46] text-white text-sm font-semibold rounded-full hover:bg-[#0D4435] transition-colors">
              {t('home.header.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
