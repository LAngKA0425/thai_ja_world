"use client";

import type { EquippedAvatar } from "../types/avatar.types";
import { AVATAR_CATEGORY_LABELS } from "../constants/avatarCategories.constants";

interface EquippedAvatarSummaryProps {
  equipped?: EquippedAvatar;
}

export default function EquippedAvatarSummary({
  equipped,
}: EquippedAvatarSummaryProps) {
  const slots: Array<{ key: keyof EquippedAvatar; label: string; emoji: string }> = [
    { key: "hair", label: AVATAR_CATEGORY_LABELS.hair, emoji: "💇" },
    { key: "top", label: AVATAR_CATEGORY_LABELS.top, emoji: "👕" },
    { key: "bottom", label: AVATAR_CATEGORY_LABELS.bottom, emoji: "👖" },
    { key: "accessory", label: AVATAR_CATEGORY_LABELS.accessory, emoji: "💍" },
  ];

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <h4 className="text-xs font-bold text-gray-500 mb-2">현재 장착</h4>
      <div className="grid grid-cols-4 gap-2">
        {slots.map(({ key, label, emoji }) => {
          const item = equipped?.[key];
          return (
            <div
              key={key}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                item
                  ? "bg-white border border-blue-100"
                  : "bg-gray-100/50 border border-dashed border-gray-200"
              }`}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-2xs text-gray-500">{label}</span>
              {item ? (
                <span className="text-2xs font-semibold text-gray-700 truncate max-w-full">
                  {item.item.name}
                </span>
              ) : (
                <span className="text-2xs text-gray-300">없음</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
