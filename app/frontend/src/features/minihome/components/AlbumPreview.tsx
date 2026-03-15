"use client";

// TODO: 사진첩 업로드/조회 API 연결
export default function AlbumPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-50 to-cyan-50/60 border-b border-teal-100/30">
        <span className="text-sm">📸</span>
        <span className="text-xs font-bold text-teal-700">사진첩</span>
        <span className="ml-auto text-2xs text-teal-400 font-semibold">준비중</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100/80 flex items-center justify-center"
            >
              <span className="text-lg opacity-20">📷</span>
            </div>
          ))}
        </div>
        <p className="text-center text-2xs text-gray-400 mt-3">사진을 업로드해 추억을 공유하세요</p>
      </div>
    </div>
  );
}
