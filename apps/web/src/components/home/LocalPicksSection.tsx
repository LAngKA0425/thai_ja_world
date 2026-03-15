'use client'

import Link from 'next/link'

const localPicks = [
  {
    id: 1,
    name: '아속 힐링 마사지',
    region: '방콕 아속',
    discount: '태자 회원 20% 할인',
    priceRange: '300~500 THB',
    emoji: '💆',
    isRecommended: true,
  },
  {
    id: 2,
    name: '반쿤매 (Ban Khun Mae)',
    region: '방콕 시암',
    discount: '태자 회원 10% 할인',
    priceRange: '200~400 THB',
    emoji: '🍛',
    isRecommended: true,
  },
  {
    id: 3,
    name: '텍사스 무까따 뷔페',
    region: '방콕 라차다',
    discount: '무료 음료 1잔',
    priceRange: '199~299 THB',
    emoji: '🥘',
    isRecommended: false,
  },
]

export function LocalPicksSection() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-[#F2994A] rounded-full inline-block"></span>
          🔥 태자 추천 로컬
        </h3>
        <Link href="/local" className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          전체보기 →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {localPicks.map((item) => (
          <Link
            key={item.id}
            href="/local"
            className="min-w-[200px] max-w-[220px] bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex-shrink-0"
          >
            {/* Image Placeholder */}
            <div className="relative w-full h-24 bg-gradient-to-br from-[#FAFAF8] to-gray-100 flex items-center justify-center text-3xl">
              {item.emoji}
              {item.isRecommended && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#145A46] text-white text-[9px] font-bold rounded-full">
                  ⭐ 추천
                </span>
              )}
            </div>
            <div className="p-2.5">
              <h4 className="text-[12px] font-bold text-[#1F2937] line-clamp-1 mb-0.5">
                {item.name}
              </h4>
              <p className="text-[10px] text-[#9CA3AF] mb-1.5">{item.region}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#F2994A]">{item.priceRange}</span>
              </div>
              {item.discount && (
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-orange-50 text-[#F2994A] text-[9px] font-bold rounded-full">
                  🎫 {item.discount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
