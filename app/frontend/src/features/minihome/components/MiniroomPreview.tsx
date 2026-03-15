"use client";

// TODO: 미니룸 아이템 배치 + 드래그 기능 구현
export default function MiniroomPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50/60 border-b border-violet-100/30">
        <span className="text-sm">🛋️</span>
        <span className="text-xs font-bold text-violet-700">미니룸</span>
        <span className="ml-auto text-2xs text-violet-400 font-semibold">꾸미기 준비중</span>
      </div>
      <div className="relative w-full h-40 bg-gradient-to-b from-sky-100/50 to-emerald-50/30 flex items-center justify-center">
        {/* Placeholder miniroom scene */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-100/50 to-transparent" />
        <div className="absolute bottom-3 left-6 w-10 h-8 bg-amber-200/60 rounded-t-lg" />
        <div className="absolute bottom-3 right-8 w-8 h-10 bg-sky-200/60 rounded-lg" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-orange-200/60 animate-bounce" />
        <p className="text-2xs text-gray-400 font-medium z-10">나만의 미니룸을 꾸며보세요</p>
      </div>
    </div>
  );
}
