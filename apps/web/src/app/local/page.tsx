'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'

interface Business {
  id: string
  name: string
  category: string
  region: string
  address: string
  priceRange: string
  description: string
  discount: string | null
  imageUrl: string | null
  imageUrls: string[]
  emoji: string
  phone: string
  lineId: string
  kakaoId: string
  mapUrl: string
  tags: string[]
  isRecommended: boolean
  hasDiscount: boolean
}

const categories = ['전체', '마사지', '맛집', '무까따', '카페', '서비스']

export default function LocalPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const cat = selectedCategory === '전체' ? '' : `?category=${selectedCategory}`
    fetch(`/api/local${cat}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBusinesses(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedCategory])

  const discountCount = businesses.filter(b => b.hasDiscount).length

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#1F2937]">📍 로컬추천</h1>
          <Link href="/" className="text-xs text-[#9CA3AF]">홈으로</Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <section className="px-4 pt-5 pb-3 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#145A46] to-[#1A7A5E] rounded-2xl p-4 text-white">
            <p className="text-[11px] font-medium text-white/70 mb-1">태자 회원 전용 혜택</p>
            <h2 className="text-lg font-bold leading-snug mb-1.5">태국 현지 업소 추천 & 할인</h2>
            <p className="text-[12px] text-white/80 leading-relaxed mb-3">
              운영자가 직접 검증한 로컬 업소를 소개합니다.<br />
              태자 회원이라면 특별 할인을 받을 수 있어요.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full text-[11px] font-bold backdrop-blur-sm">
                🏪 {businesses.length}개 업소
              </span>
              {discountCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F2994A] rounded-full text-[11px] font-bold">
                  🎫 {discountCount}개 할인 중
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 pb-3 max-w-3xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#145A46] text-white shadow-sm'
                    : 'bg-white text-[#6B7280] border border-gray-200 hover:border-[#145A46]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="px-4 pb-2 max-w-3xl mx-auto">
          <p className="text-[12px] text-[#9CA3AF]">{businesses.length}개 업소</p>
        </div>

        {/* Business Cards */}
        <section className="px-4 pb-6 max-w-3xl mx-auto">
          {loading ? (
            <p className="text-center text-[#9CA3AF] text-sm py-8">불러오는 중...</p>
          ) : (
            <div className="space-y-4">
              {businesses.map(biz => (
                <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image or Emoji Header */}
                  {biz.imageUrl ? (
                    <div className="relative w-full h-40 bg-gray-100">
                      <img src={biz.imageUrl} alt={biz.name} className="w-full h-full object-cover" />
                      {biz.isRecommended && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-[#145A46] text-white text-[10px] font-bold rounded-full">⭐ 추천</span>
                      )}
                      {biz.hasDiscount && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-[#F2994A] text-white text-[10px] font-bold rounded-full">🎫 할인</span>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-24 bg-gradient-to-br from-[#FAFAF8] to-gray-100 flex items-center justify-center text-3xl">
                      {biz.emoji}
                      {biz.isRecommended && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#145A46] text-white text-[9px] font-bold rounded-full">⭐ 추천</span>
                      )}
                    </div>
                  )}

                  <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === biz.id ? null : biz.id)}>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-[15px] font-bold text-[#1F2937]">{biz.name}</h3>
                      <span className="text-[11px] text-[#9CA3AF] bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">{biz.category}</span>
                    </div>
                    <p className="text-[12px] text-[#6B7280] mb-1">📍 {biz.region} · {biz.address}</p>
                    <p className="text-[13px] font-bold text-[#F2994A] mb-2">{biz.priceRange}</p>

                    {biz.discount && (
                      <span className="inline-block px-2.5 py-1 bg-orange-50 text-[#F2994A] text-[11px] font-bold rounded-full mb-2">
                        🎫 {biz.discount}
                      </span>
                    )}

                    {/* Expanded Details */}
                    {expandedId === biz.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[13px] text-[#374151] leading-relaxed mb-3">{biz.description}</p>

                        {biz.imageUrls && biz.imageUrls.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                            {biz.imageUrls.map((url, idx) => (
                              <img key={idx} src={url} alt={`${biz.name} ${idx + 1}`}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                            ))}
                          </div>
                        )}

                        {biz.tags && biz.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {biz.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-50 text-[11px] text-[#6B7280] rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {biz.phone && (
                            <a href={`tel:${biz.phone}`} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-[11px] font-semibold rounded-full">
                              📞 전화
                            </a>
                          )}
                          {biz.lineId && (
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-[11px] font-semibold rounded-full">
                              💬 Line: {biz.lineId}
                            </span>
                          )}
                          {biz.mapUrl && (
                            <a href={biz.mapUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-full">
                              🗺️ 지도보기
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-[#9CA3AF] mt-2 text-center">
                      {expandedId === biz.id ? '접기 ▲' : '상세보기 ▼'}
                    </p>
                  </div>
                </div>
              ))}

              {businesses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🏪</p>
                  <p className="text-[14px] font-semibold text-[#6B7280]">해당 카테고리에 등록된 업소가 없습니다</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <HomeBottomNav />
    </div>
  )
}
