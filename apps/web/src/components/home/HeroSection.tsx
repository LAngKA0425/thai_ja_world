'use client'

import { useState, useEffect } from 'react'

interface BriefingItem {
  id: string
  categoryLabel: string
  categoryColor: string
  title: string
  summary: string
  time: string
  views: number
  category: string
}

const fallbackBriefings = [
  {
    id: 'fb1',
    categoryLabel: '태국뉴스',
    categoryColor: 'bg-[#145A46]',
    title: '뉴스를 불러오는 중입니다...',
    summary: '잠시만 기다려주세요.',
    time: '',
    views: 0,
    category: 'briefing',
  },
]

const tagEmoji: Record<string, string> = {
  briefing: '📰',
  local_tip: '🏥',
  visa_info: '✈️',
  incident: '🚨',
}

export function HeroSection() {
  const [briefings, setBriefings] = useState<BriefingItem[]>(fallbackBriefings)

  useEffect(() => {
    fetch('/api/community/posts?section=briefing&limit=5')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBriefings(data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="px-4 pt-5 pb-2 max-w-3xl mx-auto">
      {/* Hero Copy */}
      <div className="mb-4">
        <p className="text-[#6B7280] text-sm font-medium mb-1">🇹🇭 태국 한인 생활 플랫폼</p>
        <h2 className="text-xl font-bold text-[#1F2937] leading-snug">
          뉴스 · 생활정보 · 맛집 · 중고마켓 · 구인구직
        </h2>
      </div>

      {/* Today's Briefing */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
            <span className="w-1.5 h-5 bg-[#145A46] rounded-full inline-block"></span>
            오늘의 브리핑
          </h3>
          <span className="text-xs text-[#9CA3AF]">운영자 큐레이션</span>
        </div>

        <div className="space-y-2.5">
          {briefings.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-[#145A46]/20 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`${item.categoryColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {item.categoryLabel}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{item.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1F2937] leading-snug mb-1 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-1">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-[#9CA3AF]">조회 {item.views}</span>
                  </div>
                </div>
                {/* Thumbnail placeholder */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 flex items-center justify-center text-lg">
                  {tagEmoji[item.category] || '📰'}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
