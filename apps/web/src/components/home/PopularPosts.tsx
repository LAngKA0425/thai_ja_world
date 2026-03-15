'use client'

const popularPosts = [
  {
    id: 1,
    rank: 1,
    title: '태국에서 한국 넷플릭스 보는 3가지 방법',
    comments: 87,
    views: 2341,
    badge: '🔥',
  },
  {
    id: 2,
    rank: 2,
    title: '방콕 한인마트 가격 비교 총정리 (2026년 3월)',
    comments: 54,
    views: 1892,
    badge: '🔥',
  },
  {
    id: 3,
    rank: 3,
    title: '태국 은행 계좌 개설 후기 - 카시콘 vs 방콕뱅크',
    comments: 42,
    views: 1456,
    badge: null,
  },
  {
    id: 4,
    rank: 4,
    title: '수완나폼 공항에서 시내까지 가장 싼 방법',
    comments: 38,
    views: 1203,
    badge: null,
  },
  {
    id: 5,
    rank: 5,
    title: '태국 생활비 현실 - 월 얼마면 될까?',
    comments: 31,
    views: 987,
    badge: null,
  },
]

export function PopularPosts() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-[#F2994A] rounded-full inline-block"></span>
          오늘 인기글
        </h3>
        <span className="text-[10px] text-[#9CA3AF] bg-gray-50 px-2 py-0.5 rounded-full">조회수 기준</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {popularPosts.map((post, idx) => (
          <article
            key={post.id}
            className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
              idx !== popularPosts.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <span className={`text-sm font-black w-6 text-center ${
              post.rank <= 3 ? 'text-[#145A46]' : 'text-[#D1D5DB]'
            }`}>
              {post.rank}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-semibold text-[#1F2937] line-clamp-1">
                {post.badge && <span className="mr-1">{post.badge}</span>}
                {post.title}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] flex-shrink-0">
              <span>조회 {post.views.toLocaleString()}</span>
              <span>💬 {post.comments}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
