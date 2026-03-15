'use client'

const dummyPosts = [
  {
    id: '1',
    title: '태국 생활 3개월 후기',
    preview: '방콕에 온 지 벌써 3개월이 지났다. 처음엔 날씨에 적응하기 힘들었지만...',
    date: '2026.03.10',
    comments: 5,
    likes: 12,
  },
  {
    id: '2',
    title: '치앙마이 맛집 리스트',
    preview: '치앙마이 여행하면서 발견한 숨은 맛집들을 정리해봤어요. 현지인 추천...',
    date: '2026.03.06',
    comments: 8,
    likes: 23,
  },
  {
    id: '3',
    title: '태국어 공부 일지 #1',
    preview: '오늘부터 태국어 공부를 시작했다. 성조가 4개나 있어서 어렵지만...',
    date: '2026.03.02',
    comments: 3,
    likes: 7,
  },
  {
    id: '4',
    title: '방콕 주말 나들이 코스',
    preview: '주말마다 방콕 이곳저곳을 돌아다니면서 발견한 좋은 코스를 공유합니다...',
    date: '2026.02.27',
    comments: 11,
    likes: 31,
  },
]

export function MinihomePosts() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1F2937]">내 게시글</span>
          <span className="text-xs text-[#9CA3AF]">{dummyPosts.length}개</span>
        </div>
        <button className="text-xs text-[#145A46] font-semibold px-3 py-1.5 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] transition-colors">
          + 글쓰기
        </button>
      </div>

      {/* Post List */}
      <div className="space-y-2">
        {dummyPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#C8E6C9] hover:shadow-sm transition-all cursor-pointer"
          >
            <h4 className="text-[13px] font-bold text-[#1F2937] mb-1 line-clamp-1">{post.title}</h4>
            <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed mb-2">{post.preview}</p>
            <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
              <span>{post.date}</span>
              <span className="flex items-center gap-0.5">💬 {post.comments}</span>
              <span className="flex items-center gap-0.5">❤️ {post.likes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="text-center py-3">
        <p className="text-[11px] text-[#9CA3AF]">일상을 기록하고 공유해보세요 ✍️</p>
      </div>
    </div>
  )
}
