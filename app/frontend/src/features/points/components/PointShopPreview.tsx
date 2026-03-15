"use client";

import { POINT_SHOP_CATEGORIES, POINT_UNIT } from "../constants/pointShop.constants";

// TODO: 실제 상점 목록 API 연결 + 구매 플로우 구현
export default function PointShopPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50/60 border-b border-amber-100/30">
        <span className="text-sm">🏪</span>
        <span className="text-xs font-bold text-amber-700">포인트 샵</span>
        <span className="ml-auto inline-flex items-center gap-1 text-2xs text-amber-500 font-semibold">
          오픈 예정
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2.5">
          {POINT_SHOP_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50"
            >
              <span className="text-lg">{cat.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">{cat.label}</p>
                <p className="text-2xs text-gray-400">준비중</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-2xs text-gray-400 mt-3">
          {POINT_UNIT}로 다양한 아이템을 구매할 수 있어요
        </p>
      </div>
    </div>
  );
}
