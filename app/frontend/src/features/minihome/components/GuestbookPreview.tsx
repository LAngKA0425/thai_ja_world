"use client";

// TODO: 방명록 작성/조회 API 연결
const PLACEHOLDER_ENTRIES = [
  { nickname: "방콕러", content: "미니홈피 구경 왔어요~ 잘 꾸며놨네요!", time: "방금 전" },
  { nickname: "치앙마이", content: "반갑습니다 👋 태자에서 만나요~", time: "1시간 전" },
];

export default function GuestbookPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-50 to-rose-50/60 border-b border-pink-100/30">
        <span className="text-sm">📝</span>
        <span className="text-xs font-bold text-pink-700">방명록</span>
        <span className="ml-auto text-2xs text-pink-400 font-semibold">{PLACEHOLDER_ENTRIES.length}개</span>
      </div>
      <div className="p-4 space-y-3">
        {PLACEHOLDER_ENTRIES.map((entry, i) => (
          <div key={i} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xs font-bold text-pink-500">{entry.nickname.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-gray-700">{entry.nickname}</span>
                <span className="text-2xs text-gray-300">{entry.time}</span>
              </div>
              <p className="text-2xs text-gray-500 mt-0.5">{entry.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
