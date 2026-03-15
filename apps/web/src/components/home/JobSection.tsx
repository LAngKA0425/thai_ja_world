'use client'

const jobs = [
  {
    id: 1,
    type: '채용',
    typeColor: 'bg-[#145A46] text-white',
    title: '한국어 가능 호텔 프론트 직원 모집',
    company: '방콕 ○○호텔',
    region: '방콕',
    salary: '25,000~35,000 THB',
    time: '오늘',
  },
  {
    id: 2,
    type: '채용',
    typeColor: 'bg-[#145A46] text-white',
    title: '한식당 홀서빙 파트타임',
    company: '아속 한식당',
    region: '방콕 아속',
    salary: '시급 80 THB',
    time: '오늘',
  },
  {
    id: 3,
    type: '구직',
    typeColor: 'bg-[#F2994A] text-white',
    title: '한-태 통번역 가능, 프리랜서 구직합니다',
    company: '경력 5년',
    region: '방콕 전체',
    salary: '협의',
    time: '어제',
  },
]

export function JobSection() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-cyan-500 rounded-full inline-block"></span>
          구인구직
        </h3>
        <button className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          더보기 →
        </button>
      </div>

      <div className="space-y-2">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-[#145A46]/20 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${job.typeColor}`}>
                    {job.type}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-[#9CA3AF] font-medium">
                    {job.region}
                  </span>
                </div>
                <h4 className="text-[13px] font-bold text-[#1F2937] line-clamp-1 mb-0.5">
                  {job.title}
                </h4>
                <p className="text-[11px] text-[#6B7280]">{job.company}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-bold text-[#F2994A]">{job.salary}</p>
                <p className="text-[10px] text-[#D1D5DB] mt-0.5">{job.time}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
