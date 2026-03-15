"use client";

export default function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative mb-5">
        <span className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl text-4xl shadow-sm">
          🔔
        </span>
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 bg-white rounded-xl shadow-sm text-base border border-gray-100/60">
          ✨
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-gray-700 mb-1.5">아직 알림이 없어요</h3>
      <p className="text-xs text-gray-400 text-center leading-relaxed max-w-[220px]">
        새 알림이 오면 여기서<br />바로 확인할 수 있어요
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        <span className="inline-flex items-center px-2.5 py-1 bg-sky-50/80 rounded-full text-2xs font-semibold text-sky-500 border border-sky-100/50">📢 핫이슈</span>
        <span className="inline-flex items-center px-2.5 py-1 bg-pink-50/80 rounded-full text-2xs font-semibold text-pink-500 border border-pink-100/50">💬 댓글</span>
        <span className="inline-flex items-center px-2.5 py-1 bg-amber-50/80 rounded-full text-2xs font-semibold text-amber-500 border border-amber-100/50">⚡ 퀘스트</span>
        <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50/80 rounded-full text-2xs font-semibold text-emerald-500 border border-emerald-100/50">📅 예약</span>
      </div>
    </div>
  );
}
