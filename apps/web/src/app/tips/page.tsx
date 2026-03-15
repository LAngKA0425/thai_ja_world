'use client'

import { useState } from 'react'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'
import { MessengerChannels } from '@/components/tips/MessengerChannels'
import { TipSubmitForm } from '@/components/tips/TipSubmitForm'
import { TodayTips } from '@/components/tips/TodayTips'

/* ── mock data ── */
const categories = [
  { key: 'all', label: '전체', icon: '📢' },
  { key: 'admin', label: '행정', icon: '📑' },
  { key: 'traffic', label: '교통', icon: '🚗' },
  { key: 'safety', label: '치안', icon: '🛡️' },
  { key: 'deal', label: '할인', icon: '💰' },
  { key: 'local', label: '로컬소식', icon: '📍' },
  { key: 'food', label: '맛집', icon: '🍜' },
]

const regionTags = ['전체', '방콕', '파타야', '치앙마이', '푸켓', '후아힌']

const tips = [
  { id: 1, text: '방콕 이민국 오늘 대기 2시간 이상 — 오후에 가세요', region: '방콕', time: '30분 전', reactions: 24, category: '행정', catColor: 'bg-red-50 text-red-600' },
  { id: 2, text: '아속 소이 23 도로 공사 중, 우회 필요합니다', region: '방콕', time: '1시간 전', reactions: 15, category: '교통', catColor: 'bg-amber-50 text-amber-600' },
  { id: 3, text: '파타야 워킹스트릿 근처 소매치기 주의보', region: '파타야', time: '2시간 전', reactions: 42, category: '치안', catColor: 'bg-rose-50 text-rose-600' },
  { id: 4, text: '치앙마이 님만해민 새 한식당 오픈 — 가격 괜찮음', region: '치앙마이', time: '3시간 전', reactions: 19, category: '맛집', catColor: 'bg-emerald-50 text-emerald-600' },
  { id: 5, text: '방콕 BTS 실롬 라인 오전 10시까지 운행 지연', region: '방콕', time: '4시간 전', reactions: 31, category: '교통', catColor: 'bg-amber-50 text-amber-600' },
  { id: 6, text: '푸켓 빠통비치 해변 정리 작업 중, 내일까지 출입 제한', region: '푸켓', time: '5시간 전', reactions: 8, category: '로컬소식', catColor: 'bg-blue-50 text-blue-600' },
  { id: 7, text: '아속 소이 11 마사지 업소 태자 회원 30% 할인 이벤트', region: '방콕', time: '6시간 전', reactions: 56, category: '할인', catColor: 'bg-violet-50 text-violet-600' },
  { id: 8, text: '치앙마이 이민국 오후 2시 이후 접수 마감 주의', region: '치앙마이', time: '7시간 전', reactions: 22, category: '행정', catColor: 'bg-red-50 text-red-600' },
  { id: 9, text: '파타야 센트럴 페스티벌 내 환전소 환율 좋음 (39.5)', region: '파타야', time: '8시간 전', reactions: 37, category: '로컬소식', catColor: 'bg-blue-50 text-blue-600' },
  { id: 10, text: '방콕 라차다 야시장 이번 주말 특별 세일', region: '방콕', time: '9시간 전', reactions: 14, category: '할인', catColor: 'bg-violet-50 text-violet-600' },
]

export default function TipsPage() {
  const [selectedCat, setSelectedCat] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('전체')

  const catMap: Record<string, string> = { admin: '행정', traffic: '교통', safety: '치안', deal: '할인', local: '로컬소식', food: '맛집' }

  const filtered = tips
    .filter((t) => selectedCat === 'all' || t.category === catMap[selectedCat])
    .filter((t) => selectedRegion === '전체' || t.region === selectedRegion)

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe-top">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#1F2937]">🔔 실시간 제보</h1>
          <button className="px-3.5 py-1.5 bg-[#F2994A] text-white text-[12px] font-bold rounded-full hover:bg-[#E08A3A] transition-colors">
            제보하기
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="px-4 pt-4 pb-2 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#F2994A]/10 to-[#F2C94C]/10 rounded-2xl p-5 border border-[#F2994A]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-[16px] font-bold text-[#1F2937]">실시간 제보</h2>
            </div>
            <p className="text-[13px] text-[#374151] leading-relaxed mb-2">
              태국에서 일어나는 사건, 뉴스, 정보, 생활 팁을<br />
              익명으로 빠르게 제보해주세요.
            </p>
            <div className="bg-white/60 rounded-xl px-3 py-2 mt-2">
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                🔒 제보는 완전 익명이며 관리자 검토 후 커뮤니티에 공유됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* Big CTA — 실시간 제보하기 / 제보 폼 */}
        <TipSubmitForm />

        <div className="h-2 bg-gray-50"></div>

        {/* Messenger Channels */}
        <MessengerChannels />

        <div className="h-2 bg-gray-50"></div>

        {/* Today's Tips */}
        <TodayTips />

        <div className="h-2 bg-gray-50"></div>

        {/* Category Tabs */}
        <section className="px-4 py-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[14px] font-bold text-[#1F2937]">전체 제보</h3>
            <span className="text-[10px] text-[#F2994A] font-semibold">익명 제보 환영</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCat(c.key)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                  selectedCat === c.key
                    ? 'bg-[#F2994A] text-white shadow-sm'
                    : 'bg-white text-[#6B7280] border border-gray-200 hover:border-[#F2994A]/30'
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Region Tags */}
        <section className="px-4 pb-2 max-w-3xl mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {regionTags.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedRegion === r
                    ? 'bg-[#F2C94C]/20 text-[#1F2937] border border-[#F2C94C]'
                    : 'bg-gray-50 text-[#9CA3AF] hover:bg-gray-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Tips List */}
        <section className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-[#6B7280]">
              {selectedRegion === '전체' ? '전체' : selectedRegion} · {filtered.length}건
            </h3>
            <span className="text-[10px] text-[#9CA3AF]">최신순</span>
          </div>

          <div className="space-y-2.5">
            {filtered.map((tip) => (
              <article key={tip.id} className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-[#F2994A]/20 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">🔔</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-[#9CA3AF]">익명</span>
                      <span className="text-[10px] text-[#D1D5DB]">·</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tip.catColor}`}>{tip.category}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-[#9CA3AF] font-medium">{tip.region}</span>
                    </div>
                    <p className="text-[13px] text-[#374151] leading-snug line-clamp-2">{tip.text}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#9CA3AF]">
                      <span>{tip.time}</span>
                      <button className="flex items-center gap-0.5 hover:text-[#F2994A] transition-colors">👍 {tip.reactions}</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-[13px] text-[#6B7280]">해당 조건에 맞는 제보가 없습니다</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <HomeBottomNav />
    </div>
  )
}
