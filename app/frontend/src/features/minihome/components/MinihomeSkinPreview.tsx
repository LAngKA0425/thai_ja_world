"use client";

import type { MinihomeSkinItem } from "../constants/minihomeSkin.constants";
import { SKIN_TYPE_LABELS, SKIN_TYPE_EMOJIS } from "../constants/minihomeSkin.constants";

interface MinihomeSkinPreviewProps {
  skin: MinihomeSkinItem;
  isOwned?: boolean;
  isEquipped?: boolean;
  expiresAt?: string;
  onPurchase?: (skinId: string) => void;
  onEquip?: (skinId: string) => void;
  userPoints?: number;
}

export default function MinihomeSkinPreview({
  skin,
  isOwned = false,
  isEquipped = false,
  expiresAt,
  onPurchase,
  onEquip,
  userPoints = 0,
}: MinihomeSkinPreviewProps) {
  const canAfford = userPoints >= skin.priceTp;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isEquipped
          ? "border-blue-400 shadow-md ring-2 ring-blue-200"
          : isExpired
          ? "border-red-200 opacity-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* 스킨 프리뷰 영역 */}
      <div
        className="h-28 relative flex items-end justify-center pb-3"
        style={{ background: skin.gradientCss }}
      >
        {/* 미니홈피 느낌의 창문 UI */}
        <div className="absolute top-2 left-2 right-2 bg-white/30 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-2xs text-white/80 ml-1 font-medium">미니홈피</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full w-3/4" />
          <div className="h-1.5 bg-white/15 rounded-full w-1/2 mt-1" />
        </div>

        {/* 네온 효과 (네온 타입만) */}
        {skin.skinType === "neon" && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${skin.primaryColor} 0%, transparent 60%)`,
              animation: "pulse 2s infinite",
            }}
          />
        )}

        {/* 상태 뱃지 */}
        <div className="absolute top-2 right-2">
          {isEquipped ? (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-2xs font-bold rounded-full shadow-sm">
              사용중
            </span>
          ) : isOwned && !isExpired ? (
            <span className="px-2 py-0.5 bg-green-500 text-white text-2xs font-bold rounded-full shadow-sm">
              보유중
            </span>
          ) : isExpired ? (
            <span className="px-2 py-0.5 bg-red-500 text-white text-2xs font-bold rounded-full shadow-sm">
              만료
            </span>
          ) : null}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="bg-white p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{SKIN_TYPE_EMOJIS[skin.skinType]}</span>
          <span className="text-2xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
            {SKIN_TYPE_LABELS[skin.skinType]}
          </span>
        </div>

        <p className="text-sm font-bold text-gray-800">{skin.name}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-yellow-600">
              {skin.priceTp}
              <span className="text-2xs text-gray-400 ml-0.5">TP</span>
            </span>
            <span className="text-2xs text-blue-500 font-medium">
              {skin.durationDays}일
            </span>
          </div>

          {isOwned && daysLeft !== null && !isExpired && (
            <span className="text-2xs text-orange-500 font-medium">
              {daysLeft}일 남음
            </span>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="mt-2">
          {isOwned && !isExpired && !isEquipped ? (
            <button
              onClick={() => onEquip?.(skin.id)}
              className="w-full py-1.5 text-2xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              적용하기
            </button>
          ) : !isOwned ? (
            <button
              onClick={() => onPurchase?.(skin.id)}
              disabled={!canAfford || !skin.isActive}
              className={`w-full py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
                canAfford && skin.isActive
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {!canAfford ? "포인트 부족" : "구매하기"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
