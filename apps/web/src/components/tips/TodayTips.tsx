'use client'

const todayTips = [
  {
    id: 1,
    title: '방콕 BTS 지갑 분실 주의',
    summary: '아속역 BTS 게이트 근처에서 지갑 분실 사례 다수 발생. 가방 앞으로 메세요.',
    category: '사건',
    catColor: 'bg-red-50 text-red-600',
    region: '방콕',
    time: '1시간 전',
    reactions: 34,
    icon: '🚨',
  },
  {
    id: 2,
    title: '수쿰빗 마사지 할인 정보',
    summary: '소이 24 타이 마사지숍 이번 주말 50% 할인 이벤트 진행 중.',
    category: '정보',
    catColor: 'bg-blue-50 text-blue-600',
    region: '방콕',
    time: '2시간 전',
    reactions: 21,
    icon: '📢',
  },
  {
    id: 3,
    title: '태국 병원 한국어 가능 리스트',
    summary: '범룽랏, 사미티벳, 방콕병원 등 한국어 통역 가능 병원 정리.',
    category: '생활팁',
    catColor: 'bg-emerald-50 text-emerald-600',
    region: '방콕',
    time: '3시간 전',
    reactions: 67,
    icon: '💡',
  },
  {
    id: 4,
    title: '택시 사기 주의 — 미터기 거부',
    summary: '수완나품 공항 출구 택시 미터기 거부 다수. 그랩 사용 권장.',
    category: '사기주의',
    catColor: 'bg-amber-50 text-amber-600',
    region: '방콕',
    time: '4시간 전',
    reactions: 45,
    icon: '⚠️',
  },
  {
    id: 5,
    title: '파타야 한인 마트 새로 오픈',
    summary: '파타야 센트럴 근처 한인 마트 오픈. 한국 식품 다양하게 구비.',
    category: '정보',
    catColor: 'bg-blue-50 text-blue-600',
    region: '파타야',
    time: '5시간 전',
    reactions: 28,
    icon: '📢',
  },
]

export function TodayTips() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="text-[14px] font-bold text-[#1F2937]">오늘의 제보</h3>
        </div>
        <span className="text-[10px] text-[#F2994A] font-semibold bg-[#F2994A]/10 px-2 py-0.5 rounded-full">
          실시간
        </span>
      </div>

      <div className="space-y-2.5">
        {todayTips.map((tip) => (
          <article
            key={tip.id}
            className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-[#F2994A]/20 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-[#9CA3AF]">익명</span>
                  <span className="text-[10px] text-[#D1D5DB]">·</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tip.catColor}`}>
                    {tip.category}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-[#9CA3AF] font-medium">
                    {tip.region}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-[#1F2937] mb-0.5">{tip.title}</p>
                <p className="text-[12px] text-[#6B7280] leading-snug line-clamp-2">{tip.summary}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#9CA3AF]">
                  <span>{tip.time}</span>
                  <button className="flex items-center gap-0.5 hover:text-[#F2994A] transition-colors">
                    👍 {tip.reactions}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
