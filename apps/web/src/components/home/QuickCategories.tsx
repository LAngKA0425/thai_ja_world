'use client'

import Link from 'next/link'

const categories = [
  { icon: '📰', label: '태국뉴스', href: '/community', color: 'bg-emerald-50 text-emerald-700' },
  { icon: '📋', label: '생활정보', href: '/community', color: 'bg-blue-50 text-blue-700' },
  { icon: '🔔', label: '익명제보', href: '/tips', color: 'bg-orange-50 text-orange-700' },
  { icon: '🍜', label: '맛집추천', href: '/local', color: 'bg-red-50 text-red-700' },
  { icon: '📑', label: '비자정보', href: '/community', color: 'bg-violet-50 text-violet-700' },
  { icon: '🛒', label: '중고마켓', href: '/community', color: 'bg-amber-50 text-amber-700' },
  { icon: '💼', label: '구인구직', href: '/community', color: 'bg-cyan-50 text-cyan-700' },
  { icon: '🏠', label: '미니홈피', href: '/my', color: 'bg-emerald-50 text-emerald-700' },
]

export function QuickCategories() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-4 gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className={`w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center text-xl`}>
              {cat.icon}
            </div>
            <span className="text-[11px] font-semibold text-[#374151] text-center leading-tight">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
