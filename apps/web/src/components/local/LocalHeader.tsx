'use client'

import Link from 'next/link'

export function LocalHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe-top">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Back + Title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-[#1F2937]">
            🔥 로컬추천
          </h1>
        </div>

        {/* Search */}
        <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
