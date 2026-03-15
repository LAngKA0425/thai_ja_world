"use client";

// TODO: 장터 전용 그리드 뷰 구현 (기존 홈 장터 섹션과 분리)
const PLACEHOLDER_ITEMS = [
  { title: "에어컨 리모컨", price: "200฿", area: "방콕 아속", status: "판매중" },
  { title: "한국 라면 박스", price: "350฿", area: "파타야", status: "판매중" },
  { title: "자전거", price: "3,000฿", area: "치앙마이", status: "예약중" },
  { title: "노트북 거치대", price: "800฿", area: "방콕 실롬", status: "판매중" },
];

export default function MarketGridPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border-b border-emerald-100/30">
        <span className="text-sm">🛒</span>
        <span className="text-xs font-bold text-emerald-700">번개장터</span>
        <span className="ml-auto text-2xs text-emerald-400 font-semibold">{PLACEHOLDER_ITEMS.length}개</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-3">
        {PLACEHOLDER_ITEMS.map((item, i) => (
          <div key={i} className="p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
            <div className="w-full h-16 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-2">
              <span className="text-2xl opacity-20">🛍️</span>
            </div>
            <p className="text-2xs font-bold text-gray-700 truncate">{item.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xs font-black text-accent-500">{item.price}</span>
              <span className="text-2xs text-gray-400">📍 {item.area}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
