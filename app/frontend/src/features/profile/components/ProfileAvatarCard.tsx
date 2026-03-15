"use client";

import AvatarPreview from "@/features/avatar/components/AvatarPreview";
import type { EquippedAvatar } from "@/features/avatar/types/avatar.types";

interface ProfileAvatarCardProps {
  equipped?: EquippedAvatar;
  onCustomize?: () => void;
}

export default function ProfileAvatarCard({
  equipped,
  onCustomize,
}: ProfileAvatarCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30 border border-blue-100/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <span>👤</span> 내 아바타
        </h4>
        {onCustomize && (
          <button
            onClick={onCustomize}
            className="text-2xs text-blue-500 hover:text-blue-600 font-medium"
          >
            꾸미기 →
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <AvatarPreview equipped={equipped} size="sm" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xs text-gray-400">머리</span>
            <span className="text-2xs font-medium text-gray-600">
              {equipped?.hair?.item.name ?? "기본"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-gray-400">상의</span>
            <span className="text-2xs font-medium text-gray-600">
              {equipped?.top?.item.name ?? "기본"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-gray-400">하의</span>
            <span className="text-2xs font-medium text-gray-600">
              {equipped?.bottom?.item.name ?? "기본"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-gray-400">악세</span>
            <span className="text-2xs font-medium text-gray-600">
              {equipped?.accessory?.item.name ?? "없음"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
