"use client";

// TODO: 실제 마사지 업체 데이터 연결 + 예약 플로우 구현
interface MassageReservationCardProps {
  shopName?: string;
  area?: string;
  rating?: number;
  price?: string;
}

export default function MassageReservationCard({
  shopName = "태자 파트너 마사지샵",
  area = "방콕 아속",
  rating = 4.8,
  price = "300฿~",
}: MassageReservationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="w-full h-28 bg-gradient-to-br from-pink-50 via-rose-50/80 to-orange-50/60 flex items-center justify-center relative">
        <span className="text-4xl opacity-30">💆</span>
        <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 bg-white/90 rounded-md text-2xs font-bold text-amber-500 shadow-sm">
          ⭐ {rating}
        </span>
      </div>
      <div className="p-3.5">
        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {shopName}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <span className="inline-flex items-center gap-0.5 text-2xs text-gray-400">📍 {area}</span>
          <span className="text-xs font-black text-accent-500">{price}</span>
        </div>
        <button className="w-full mt-3 py-2 rounded-xl bg-pink-50 text-2xs font-bold text-pink-600 border border-pink-100/50 hover:bg-pink-100 transition-colors">
          예약하기 (준비중)
        </button>
      </div>
    </div>
  );
}
