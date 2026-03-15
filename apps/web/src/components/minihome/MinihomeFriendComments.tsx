'use client'

const dummyComments = [
  {
    id: '1',
    author: '방콕사는민수',
    avatar: '😎',
    content: '홈피 진짜 이쁘다~ 자주 놀러올게! 🌟',
    date: '2026.03.11',
    relation: '일촌',
  },
  {
    id: '2',
    author: '치앙마이소피',
    avatar: '🌸',
    content: '같이 태국어 공부하자! 화이팅 💪',
    date: '2026.03.09',
    relation: '일촌',
  },
  {
    id: '3',
    author: '파타야현우',
    avatar: '🏄',
    content: '다음에 파타야 놀러와~ 해변이 최고야',
    date: '2026.03.07',
    relation: '일촌',
  },
  {
    id: '4',
    author: '서울에서온지은',
    avatar: '✈️',
    content: '태국 생활 부럽다... 나도 곧 갈게!',
    date: '2026.03.04',
    relation: '일촌',
  },
  {
    id: '5',
    author: '후아힌제이',
    avatar: '🌊',
    content: '사진첩에 올린 사진 너무 좋다 👍',
    date: '2026.03.01',
    relation: '일촌',
  },
]

export function MinihomeFriendComments() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1F2937]">일촌평</span>
          <span className="text-xs text-[#9CA3AF]">{dummyComments.length}개</span>
        </div>
        <button className="text-xs text-[#145A46] font-semibold px-3 py-1.5 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] transition-colors">
          + 일촌평 남기기
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {dummyComments.map((comment) => (
          <div
            key={comment.id}
            className="relative bg-white rounded-xl border border-gray-100 p-3.5 hover:border-[#C8E6C9] transition-all"
          >
            {/* Speech bubble tail effect via left border */}
            <div className="absolute left-0 top-4 w-1 h-6 bg-[#145A46]/20 rounded-r-full" />

            <div className="flex items-start gap-3 pl-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] flex items-center justify-center text-lg flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-bold text-[#1F2937]">{comment.author}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#FFF8E1] text-[#F9A825] font-semibold rounded-full">{comment.relation}</span>
                </div>
                <p className="text-[12px] text-[#4B5563] leading-relaxed">{comment.content}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1.5">{comment.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="text-center py-3">
        <p className="text-[11px] text-[#9CA3AF]">일촌에게 한마디 남겨보세요 💬</p>
      </div>
    </div>
  )
}
