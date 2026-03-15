'use client'

const marketItems = [
  {
    id: 1,
    title: '다이슨 에어랩 (거의 새것)',
    price: '8,500 THB',
    region: '방콕 통로',
    time: '15분 전',
    status: '판매중',
    statusColor: 'text-[#145A46] bg-emerald-50',
    emoji: '💇',
  },
  {
    id: 2,
    title: '삼성 갤럭시 S25 울트라 256GB',
    price: '22,000 THB',
    region: '방콕 아속',
    time: '1시간 전',
    status: '판매중',
    statusColor: 'text-[#145A46] bg-emerald-50',
    emoji: '📱',
  },
  {
    id: 3,
    title: '자전거 (트렉 FX3) 상태 좋음',
    price: '12,000 THB',
    region: '파타야',
    time: '2시간 전',
    status: '예약중',
    statusColor: 'text-[#F2994A] bg-orange-50',
    emoji: '🚲',
  },
  {
    id: 4,
    title: '이케아 책상 + 의자 세트',
    price: '3,500 THB',
    region: '방콕 라차다',
    time: '3시간 전',
    status: '판매중',
    statusColor: 'text-[#145A46] bg-emerald-50',
    emoji: '🪑',
  },
]

export function MarketSection() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block"></span>
          중고마켓
        </h3>
        <button className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          더보기 →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {marketItems.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-full h-24 bg-gradient-to-br from-[#FAFAF8] to-gray-100 flex items-center justify-center text-3xl">
              {item.emoji}
            </div>
            <div className="p-2.5">
              <h4 className="text-[12px] font-semibold text-[#1F2937] line-clamp-1 mb-1">
                {item.title}
              </h4>
              <p className="text-sm font-black text-[#1F2937] mb-1">{item.price}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.statusColor}`}>
                  {item.status}
                </span>
                <span className="text-[10px] text-[#9CA3AF]">{item.region}</span>
              </div>
              <p className="text-[10px] text-[#D1D5DB] mt-1">{item.time}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
