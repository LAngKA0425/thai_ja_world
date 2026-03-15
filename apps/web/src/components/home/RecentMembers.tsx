'use client'

const recentMembers = [
  { id: '1', name: '방콕살이', avatar: '🧑', activity: '미니홈 개설' },
  { id: '2', name: '치앙마이맘', avatar: '👩', activity: '프로필 업데이트' },
  { id: '3', name: '파타야서퍼', avatar: '🧑‍🦱', activity: '미니홈 개설' },
  { id: '4', name: '태국7년차', avatar: '👨', activity: '방명록 작성' },
  { id: '5', name: '푸켓여행', avatar: '👩‍🦰', activity: '미니홈 개설' },
]

export function RecentMembers() {
  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#6B7280] flex items-center gap-1.5">
          최근 활동 회원
        </h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {recentMembers.map((m) => (
          <div
            key={m.id}
            className="flex flex-col items-center gap-1.5 min-w-[64px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl border-2 border-white shadow-sm">
              {m.avatar}
            </div>
            <span className="text-[10px] font-semibold text-[#374151] text-center leading-tight line-clamp-1 max-w-[64px]">
              {m.name}
            </span>
            <span className="text-[9px] text-[#9CA3AF]">{m.activity}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
