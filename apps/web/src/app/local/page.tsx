'use client'

import { useState, useMemo } from 'react'
import { LocalHeader } from '@/components/local/LocalHeader'
import { LocalCategoryFilter } from '@/components/local/LocalCategoryFilter'
import { LocalBusinessCard } from '@/components/local/LocalBusinessCard'
import { localBusinesses } from '@/components/local/localData'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'

const categoryMap: Record<string, string> = {
  all: '전체',
  massage: '마사지',
  restaurant: '맛집',
  mookata: '무까따',
  cafe: '카페',
  service: '서비스',
}

export default function LocalPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredBusinesses = useMemo(() => {
    if (selectedCategory === 'all') return localBusinesses
    return localBusinesses.filter(
      (b) => b.category === categoryMap[selectedCategory]
    )
  }, [selectedCategory])

  const discountCount = localBusinesses.filter((b) => b.hasDiscount).length

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      <LocalHeader />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <section className="px-4 pt-5 pb-3 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#145A46] to-[#1A7A5E] rounded-2xl p-4 text-white">
            <p className="text-[11px] font-medium text-white/70 mb-1">태자 회원 전용 혜택</p>
            <h2 className="text-lg font-bold leading-snug mb-1.5">
              태국 현지 업소 추천 & 할인
            </h2>
            <p className="text-[12px] text-white/80 leading-relaxed mb-3">
              운영자가 직접 검증한 로컬 업소를 소개합니다.<br />
              태자 회원이라면 특별 할인을 받을 수 있어요.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full text-[11px] font-bold backdrop-blur-sm">
                🏪 {localBusinesses.length}개 업소
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F2994A] rounded-full text-[11px] font-bold">
                🎫 {discountCount}개 할인 중
              </span>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 pb-3 max-w-3xl mx-auto">
          <LocalCategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        {/* Result Count */}
        <div className="px-4 pb-2 max-w-3xl mx-auto">
          <p className="text-[12px] text-[#9CA3AF]">
            {selectedCategory === 'all' ? '전체' : categoryMap[selectedCategory]} {filteredBusinesses.length}개
          </p>
        </div>

        {/* Business Cards */}
        <section className="px-4 pb-6 max-w-3xl mx-auto">
          <div className="space-y-4">
            {filteredBusinesses.map((business) => (
              <LocalBusinessCard key={business.id} business={business} />
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏪</p>
              <p className="text-[14px] font-semibold text-[#6B7280]">
                해당 카테고리에 등록된 업소가 없습니다
              </p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">
                곧 새로운 업소가 추가될 예정입니다
              </p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="px-4 pb-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-[14px] font-bold text-[#1F2937] mb-1">
              우리 업소도 등록하고 싶어요!
            </p>
            <p className="text-[12px] text-[#6B7280] mb-3">
              태자 로컬추천에 업소를 등록하고 한인 고객을 만나보세요
            </p>
            <button className="px-5 py-2.5 bg-[#145A46] text-white text-[13px] font-bold rounded-full hover:bg-[#0D4435] transition-colors">
              업소 등록 문의
            </button>
          </div>
        </section>
      </main>

      <HomeBottomNav />
    </div>
  )
}
