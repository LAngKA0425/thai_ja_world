'use client'

import Link from 'next/link'

const posts = [
  {
    id: 1,
    category: '자유게시판',
    categoryColor: 'text-[#145A46]',
    title: '방콕 아속역 근처 카페 추천 부탁드려요',
    author: '방콕살이',
    time: '10분 전',
    comments: 12,
    views: 89,
    region: '방콕',
    hasImage: false,
  },
  {
    id: 2,
    category: '정보공유',
    categoryColor: 'text-[#2563EB]',
    title: '태국 운전면허 한국면허로 교환하는 법 정리',
    author: '치앙마이교민',
    time: '32분 전',
    comments: 24,
    views: 215,
    region: '치앙마이',
    hasImage: true,
  },
  {
    id: 3,
    category: '질문',
    categoryColor: 'text-[#F2994A]',
    title: '파타야에서 한국 택배 받으신 분 계신가요?',
    author: '파타야뉴비',
    time: '1시간 전',
    comments: 8,
    views: 67,
    region: '파타야',
    hasImage: false,
  },
  {
    id: 4,
    category: '자유게시판',
    categoryColor: 'text-[#145A46]',
    title: '태국 생활 3년차, 알게 된 것들 공유합니다',
    author: '태국선배',
    time: '2시간 전',
    comments: 45,
    views: 823,
    region: '방콕',
    hasImage: true,
  },
  {
    id: 5,
    category: '정보공유',
    categoryColor: 'text-[#2563EB]',
    title: '2026년 태국 공휴일 캘린더 정리',
    author: '운영자',
    time: '3시간 전',
    comments: 18,
    views: 412,
    region: '전체',
    hasImage: false,
  },
]

export function LatestPosts() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-[#F2C94C] rounded-full inline-block"></span>
          최신 커뮤니티 글
        </h3>
        <Link href="/community" className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          더보기 →
        </Link>
      </div>

      <div className="space-y-1">
        {posts.map((post) => (
          <article
            key={post.id}
            className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/50 -mx-1 px-1 rounded-lg transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[10px] font-bold ${post.categoryColor}`}>
                  {post.category}
                </span>
                <span className="text-[10px] text-[#D1D5DB]">·</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-[#9CA3AF] font-medium">
                  {post.region}
                </span>
              </div>
              <h4 className="text-[13px] font-semibold text-[#1F2937] leading-snug line-clamp-1 mb-0.5">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                <span>{post.author}</span>
                <span>·</span>
                <span>{post.time}</span>
                <span>·</span>
                <span>조회 {post.views}</span>
                <span>·</span>
                <span>댓글 {post.comments}</span>
              </div>
            </div>
            {post.hasImage && (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-300">
                IMG
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
