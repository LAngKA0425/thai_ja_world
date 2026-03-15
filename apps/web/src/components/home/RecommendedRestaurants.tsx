'use client'

const restaurants = [
  {
    id: 1,
    name: '반쿤매 (Ban Khun Mae)',
    region: '방콕 시암',
    price: '200~400 THB',
    review: '현지인도 인정하는 정통 태국 가정식. 쏨땀이 일품.',
    badge: '운영자 추천',
    badgeColor: 'bg-[#145A46] text-white',
    emoji: '🍛',
  },
  {
    id: 2,
    name: '김밥나라 방콕점',
    region: '방콕 아속',
    price: '150~300 THB',
    review: '한식 그리울 때 가성비 좋은 분식집. 떡볶이 추천.',
    badge: '직접 가봄',
    badgeColor: 'bg-[#F2C94C] text-[#1F2937]',
    emoji: '🍱',
  },
  {
    id: 3,
    name: '씹쌉 (Sipsap) 치앙마이',
    region: '치앙마이 올드타운',
    price: '100~250 THB',
    review: '북부 태국 음식 전문. 카오소이가 최고.',
    badge: '운영자 추천',
    badgeColor: 'bg-[#145A46] text-white',
    emoji: '🍜',
  },
]

export function RecommendedRestaurants() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-[#F2C94C] rounded-full inline-block"></span>
          맛집 추천
        </h3>
        <button className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          더보기 →
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {restaurants.map((r) => (
          <article
            key={r.id}
            className="min-w-[240px] max-w-[260px] bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
          >
            {/* Image Placeholder */}
            <div className="w-full h-28 bg-gradient-to-br from-[#FAFAF8] to-gray-100 flex items-center justify-center text-4xl">
              {r.emoji}
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.badgeColor}`}>
                  {r.badge}
                </span>
                <span className="text-[10px] text-[#9CA3AF]">{r.region}</span>
              </div>
              <h4 className="text-[13px] font-bold text-[#1F2937] mb-1 line-clamp-1">{r.name}</h4>
              <p className="text-[11px] text-[#6B7280] line-clamp-2 mb-1.5">{r.review}</p>
              <span className="text-[11px] font-semibold text-[#F2994A]">{r.price}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
