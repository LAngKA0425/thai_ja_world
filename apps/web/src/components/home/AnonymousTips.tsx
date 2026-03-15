'use client'

import Link from 'next/link'

const tips = [
  {
    id: 1,
    text: '방콕 이민국 오늘 대기 2시간 이상 — 오후에 가세요',
    region: '방콕',
    time: '30분 전',
    reactions: 24,
    tag: '행정',
    tagColor: 'bg-red-50 text-red-600',
  },
  {
    id: 2,
    text: '아속 소이 23 도로 공사 중, 우회 필요합니다',
    region: '방콕',
    time: '1시간 전',
    reactions: 15,
    tag: '교통',
    tagColor: 'bg-amber-50 text-amber-600',
  },
  {
    id: 3,
    text: '파타야 워킹스트릿 근처 소매치기 주의보',
    region: '파타야',
    time: '2시간 전',
    reactions: 42,
    tag: '안전',
    tagColor: 'bg-rose-50 text-rose-600',
  },
  {
    id: 4,
    text: '치앙마이 님만해민 새 한식당 오픈 — 가격 괜찮음',
    region: '치앙마이',
    time: '3시간 전',
    reactions: 19,
    tag: '맛집',
    tagColor: 'bg-emerald-50 text-emerald-600',
  },
]

export function AnonymousTips() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-red-400 rounded-full inline-block"></span>
          실시간 제보
        </h3>
        <Link href="/tips" className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          제보하기 →
        </Link>
      </div>

      <div className="space-y-2">
        {tips.map((tip) => (
          <article
            key={tip.id}
            className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-[#9CA3AF]">익명</span>
                  <span className="text-[10px] text-[#D1D5DB]">·</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tip.tagColor}`}>
                    {tip.tag}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-[#9CA3AF] font-medium">
                    {tip.region}
                  </span>
                </div>
                <p className="text-[13px] text-[#374151] leading-snug line-clamp-2">
                  {tip.text}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#9CA3AF]">
                  <span>{tip.time}</span>
                  <span>👍 {tip.reactions}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
