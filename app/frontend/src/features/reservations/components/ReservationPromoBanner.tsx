"use client";

// TODO: 예약 시스템 오픈 시 실제 링크/CTA 연결
export default function ReservationPromoBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-50 via-rose-50/80 to-orange-50/50 rounded-2xl border border-pink-200/40 p-4 hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink-100/30 rounded-full" />
      <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-rose-100/20 rounded-full" />
      <div className="relative flex items-center gap-3">
        <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-white/80 rounded-2xl text-xl shadow-sm border border-pink-100/50 group-hover:scale-105 transition-transform">
          💆
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs font-bold text-gray-800">태자 예약 서비스</p>
            <span className="inline-flex items-center px-1.5 py-0.5 bg-pink-100/80 rounded-md text-2xs font-semibold text-pink-600">
              오픈 예정
            </span>
          </div>
          <p className="text-2xs text-gray-500 leading-relaxed">
            마사지 · 맛집 · 미용 예약을 한 번에
          </p>
        </div>
        <span className="text-gray-300 text-lg group-hover:translate-x-1 transition-transform">›</span>
      </div>
    </div>
  );
}
