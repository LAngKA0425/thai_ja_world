"use client";

// TODO: BGM 재생/관리 기능 구현 (Web Audio API or HTML5 Audio)
export default function BgmPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50/60 border-b border-indigo-100/30">
        <span className="text-sm">🎵</span>
        <span className="text-xs font-bold text-indigo-700">BGM</span>
        <span className="ml-auto text-2xs text-indigo-400 font-semibold">준비중</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/30">
          <button className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm hover:bg-indigo-600 transition-colors">
            <span className="text-white text-sm ml-0.5">▶</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">BGM을 설정해보세요</p>
            <p className="text-2xs text-gray-400">미니홈피에 배경음악을 추가하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
