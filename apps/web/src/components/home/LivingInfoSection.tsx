'use client'

const livingInfo = [
  { icon: '📑', title: '비자 연장 가이드', desc: 'Non-O / 리타이어 / ED 비자 연장 절차', tag: '비자' },
  { icon: '🏦', title: '은행 계좌 개설', desc: '카시콘 · 방콕뱅크 · SCB 비교', tag: '금융' },
  { icon: '🏥', title: '한국어 가능 병원', desc: '방콕 · 파타야 · 치앙마이 병원 리스트', tag: '의료' },
  { icon: '📱', title: '태국 통신사 비교', desc: 'AIS · TRUE · DTAC 요금제 정리', tag: '통신' },
  { icon: '🚗', title: '교통 가이드', desc: 'BTS · MRT · 그랩 · 볼트 이용법', tag: '교통' },
  { icon: '📦', title: '한국↔태국 택배', desc: '배송 방법 · 기간 · 비용 비교', tag: '배송' },
]

export function LivingInfoSection() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-[#2563EB] rounded-full inline-block"></span>
          생활정보
        </h3>
        <button className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          전체보기 →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {livingInfo.map((info) => (
          <article
            key={info.title}
            className="bg-white rounded-xl border border-gray-100 p-3 hover:border-[#145A46]/20 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                {info.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-bold text-[#1F2937] line-clamp-1 mb-0.5">
                  {info.title}
                </h4>
                <p className="text-[10px] text-[#9CA3AF] line-clamp-1">
                  {info.desc}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
