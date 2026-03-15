"use client";

// TODO: 관리자 기능 토글 패널 구현 (포인트/미니홈피/예약 온오프)
const FEATURES = [
  { id: "points", label: "포인트 시스템", emoji: "🪙", enabled: false },
  { id: "minihome", label: "미니홈피", emoji: "🏠", enabled: false },
  { id: "reservations", label: "예약 서비스", emoji: "💆", enabled: false },
  { id: "market_v2", label: "장터 v2", emoji: "🛒", enabled: true },
  { id: "jobs", label: "구인구직", emoji: "💼", enabled: true },
];

export default function AdminFeatureTogglePreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-slate-50/60 border-b border-gray-100/30">
        <span className="text-sm">⚙️</span>
        <span className="text-xs font-bold text-gray-700">기능 관리</span>
        <span className="ml-auto text-2xs text-gray-400 font-semibold">관리자 전용</span>
      </div>
      <div className="divide-y divide-gray-50">
        {FEATURES.map((feat) => (
          <div key={feat.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-base">{feat.emoji}</span>
            <span className="text-xs font-semibold text-gray-700 flex-1">{feat.label}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${
              feat.enabled
                ? "bg-emerald-50 text-emerald-600"
                : "bg-gray-100 text-gray-400"
            }`}>
              {feat.enabled ? "활성" : "준비중"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
