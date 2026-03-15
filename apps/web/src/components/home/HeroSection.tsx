'use client'

const briefings = [
  {
    id: 1,
    tag: '태국뉴스',
    tagColor: 'bg-[#145A46]',
    title: '2026 태국 비자 정책 변경 핵심 요약',
    summary: '장기체류 비자 조건이 일부 완화되었습니다. 주요 변경 사항을 정리했습니다.',
    time: '오늘 09:30',
    thumbnail: null,
    views: 342,
  },
  {
    id: 2,
    tag: '생활정보',
    tagColor: 'bg-[#F2994A]',
    title: '방콕 한인 병원 추천 TOP 5 (2026년 업데이트)',
    summary: '한국어 가능한 병원 리스트와 진료비 비교를 정리했습니다.',
    time: '오늘 08:15',
    thumbnail: null,
    views: 528,
  },
  {
    id: 3,
    tag: '환율',
    tagColor: 'bg-[#2563EB]',
    title: '오늘 환율: 1 THB = 39.2원 (▲0.3)',
    summary: '바트-원 환율 소폭 상승. 카시콘뱅크 기준 실시간 환율 안내.',
    time: '오늘 07:00',
    thumbnail: null,
    views: 891,
  },
]

export function HeroSection() {
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
                    <span className={`${item.tagColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {item.tag}
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
                  {item.tag === '태국뉴스' ? '📰' : item.tag === '생활정보' ? '🏥' : '💱'}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
