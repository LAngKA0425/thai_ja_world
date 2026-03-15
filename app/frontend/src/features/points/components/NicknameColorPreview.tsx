"use client";

import { NICKNAME_COLOR_OPTIONS, POINT_UNIT } from "../constants/pointShop.constants";

// TODO: 포인트 차감 + 닉네임 색상 변경 API 연결
export default function NicknameColorPreview() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🎨</span>
        <h3 className="text-xs font-bold text-gray-800">닉네임 색상 변경</h3>
        <span className="ml-auto text-2xs text-gray-400">포인트 샵</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {NICKNAME_COLOR_OPTIONS.slice(0, 6).map((opt) => (
          <button
            key={opt.id}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
          >
            <span className={`text-sm font-bold ${opt.colorClass}`}>닉네임</span>
            <span className="text-2xs text-gray-400 font-semibold">{POINT_UNIT} {opt.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
