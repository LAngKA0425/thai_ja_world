'use client'

const dummyPhotos = [
  { id: '1', title: '방콕 카오산로드', date: '2026.03.10', thumbnail: '' },
  { id: '2', title: '치앙마이 야시장', date: '2026.03.08', thumbnail: '' },
  { id: '3', title: '파타야 해변', date: '2026.03.05', thumbnail: '' },
  { id: '4', title: '태국 음식 모음', date: '2026.03.01', thumbnail: '' },
  { id: '5', title: '왓 아룬 사원', date: '2026.02.28', thumbnail: '' },
  { id: '6', title: '주말 브런치', date: '2026.02.25', thumbnail: '' },
]

const placeholderColors = [
  'from-emerald-100 to-teal-50',
  'from-amber-100 to-yellow-50',
  'from-rose-100 to-pink-50',
  'from-sky-100 to-blue-50',
  'from-violet-100 to-purple-50',
  'from-orange-100 to-amber-50',
]

const placeholderIcons = ['🏙️', '🌙', '🏖️', '🍜', '🏛️', '☕']

export function MinihomePhotos() {
  return (
    <div className="space-y-4">
      {/* Album Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1F2937]">전체 사진</span>
          <span className="text-xs text-[#9CA3AF]">{dummyPhotos.length}장</span>
        </div>
        <button className="text-xs text-[#145A46] font-semibold px-3 py-1.5 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] transition-colors">
          + 사진 올리기
        </button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {dummyPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#145A46]/30 transition-all"
          >
            <div className={`w-full h-full bg-gradient-to-br ${placeholderColors[idx % placeholderColors.length]} flex items-center justify-center`}>
              <span className="text-3xl group-hover:scale-110 transition-transform">{placeholderIcons[idx % placeholderIcons.length]}</span>
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <div>
                <p className="text-[10px] font-semibold text-white leading-tight">{photo.title}</p>
                <p className="text-[8px] text-white/70">{photo.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Hint */}
      <div className="text-center py-4">
        <p className="text-[11px] text-[#9CA3AF]">사진을 올려 나만의 앨범을 꾸며보세요 📷</p>
      </div>
    </div>
  )
}
