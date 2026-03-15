"use client";

import type { AvatarItem, UserAvatarInventoryItem } from "../types/avatar.types";
import { RARITY_COLORS, RARITY_LABELS } from "../constants/avatarCategories.constants";

interface AvatarItemCardProps {
  item: AvatarItem;
  inventoryItem?: UserAvatarInventoryItem;
  isEquipped?: boolean;
  onEquip?: (itemId: string) => void;
  onPurchase?: (itemId: string) => void;
  userPoints?: number;
}

export default function AvatarItemCard({
  item,
  inventoryItem,
  isEquipped = false,
  onEquip,
  onPurchase,
  userPoints = 0,
}: AvatarItemCardProps) {
  const isOwned = !!inventoryItem;
  const isExpired =
    inventoryItem?.expiresAt && new Date(inventoryItem.expiresAt) < new Date();
  const canAfford = userPoints >= item.priceTp;

  const daysLeft = inventoryItem?.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(inventoryItem.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div
      className={`relative rounded-xl border p-3 transition-all duration-200 hover:shadow-md ${
        isEquipped
          ? "border-blue-400 bg-blue-50/80 shadow-sm"
          : isExpired
          ? "border-red-200 bg-red-50/30 opacity-60"
          : isOwned
          ? "border-green-200 bg-green-50/30"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* 미리보기 */}
      <div
        className="w-full h-16 rounded-lg mb-2 flex items-center justify-center"
        style={{ backgroundColor: `${item.previewColor}20` }}
      >
        <div
          className="w-10 h-10 rounded-lg shadow-inner"
          style={{ backgroundColor: item.previewColor }}
        />
      </div>

      {/* 레어리티 */}
      {item.rarity && (
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-2xs font-bold mb-1 ${
            RARITY_COLORS[item.rarity] ?? ""
          }`}
        >
          {RARITY_LABELS[item.rarity] ?? item.rarity}
        </span>
      )}

      {/* 이름 */}
      <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>

      {/* 기간제 표시 */}
      {item.durationType === "timed" && item.durationDays && (
        <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 rounded text-2xs text-blue-600 font-medium">
          {item.durationDays}일
        </span>
      )}

      {/* 상태 뱃지 */}
      <div className="mt-2 flex items-center justify-between">
        {isEquipped ? (
          <span className="text-2xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
            착용중
          </span>
        ) : isExpired ? (
          <span className="text-2xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded">
            만료됨
          </span>
        ) : isOwned ? (
          <span className="text-2xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
            보유중
          </span>
        ) : (
          <span className="text-xs font-bold text-yellow-600">
            {item.priceTp}
            <span className="text-2xs text-gray-400 ml-0.5">TP</span>
          </span>
        )}

        {/* 남은 일수 */}
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
            onClick={() => onEquip?.(item.id)}
            className="w-full py-1.5 text-2xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            장착하기
          </button>
        ) : !isOwned ? (
          <button
            onClick={() => onPurchase?.(item.id)}
            disabled={!canAfford || !item.isActive}
            className={`w-full py-1.5 text-2xs font-semibold rounded-lg transition-colors ${
              canAfford && item.isActive
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {!item.isActive
              ? "판매중지"
              : !canAfford
              ? "포인트 부족"
              : "구매하기"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
