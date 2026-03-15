"use client";

import type { EquippedAvatar } from "../types/avatar.types";
import { DEFAULT_AVATAR_COLORS } from "../constants/avatarCategories.constants";

interface AvatarPreviewProps {
  equipped?: EquippedAvatar;
  size?: "sm" | "md" | "lg";
}

export default function AvatarPreview({
  equipped,
  size = "md",
}: AvatarPreviewProps) {
  const sizeMap = { sm: 80, md: 140, lg: 200 };
  const px = sizeMap[size];

  const hairColor = equipped?.hair?.item.previewColor ?? DEFAULT_AVATAR_COLORS.hair;
  const topColor = equipped?.top?.item.previewColor ?? DEFAULT_AVATAR_COLORS.top;
  const bottomColor = equipped?.bottom?.item.previewColor ?? DEFAULT_AVATAR_COLORS.bottom;
  const accColor = equipped?.accessory?.item.previewColor ?? DEFAULT_AVATAR_COLORS.accessory;

  const scale = px / 140;

  return (
    <div
      className="relative mx-auto flex-shrink-0"
      style={{ width: px, height: px * 1.4 }}
    >
      {/* 배경 원 */}
      <div
        className="absolute inset-0 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${topColor} 0%, transparent 70%)`,
        }}
      />

      {/* 머리 (Hair) */}
      <div
        className="absolute rounded-full shadow-sm"
        style={{
          width: 50 * scale,
          height: 35 * scale,
          top: 8 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: hairColor,
          borderRadius: `${25 * scale}px ${25 * scale}px ${10 * scale}px ${10 * scale}px`,
        }}
      />

      {/* 얼굴 */}
      <div
        className="absolute bg-amber-100 rounded-full shadow-sm border border-amber-200/50"
        style={{
          width: 40 * scale,
          height: 40 * scale,
          top: 24 * scale,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* 눈 */}
        <div
          className="absolute flex gap-1"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="rounded-full bg-gray-800"
            style={{ width: 4 * scale, height: 4 * scale }}
          />
          <div style={{ width: 8 * scale }} />
          <div
            className="rounded-full bg-gray-800"
            style={{ width: 4 * scale, height: 4 * scale }}
          />
        </div>
        {/* 입 */}
        <div
          className="absolute bg-rose-300 rounded-full"
          style={{
            width: 8 * scale,
            height: 3 * scale,
            bottom: "25%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* 악세사리 (Accessory) */}
      {equipped?.accessory && (
        <div
          className="absolute rounded-full shadow-md border-2 border-white/60"
          style={{
            width: 12 * scale,
            height: 12 * scale,
            top: 20 * scale,
            right: 30 * scale,
            backgroundColor: accColor,
          }}
        />
      )}

      {/* 상의 (Top) */}
      <div
        className="absolute rounded-lg shadow-sm"
        style={{
          width: 52 * scale,
          height: 40 * scale,
          top: 68 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: topColor,
          borderRadius: `${6 * scale}px ${6 * scale}px ${4 * scale}px ${4 * scale}px`,
        }}
      />

      {/* 하의 (Bottom) */}
      <div
        className="absolute shadow-sm"
        style={{
          width: 48 * scale,
          height: 44 * scale,
          top: 105 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: bottomColor,
          borderRadius: `0 0 ${8 * scale}px ${8 * scale}px`,
        }}
      >
        {/* 다리 분리선 */}
        <div
          className="absolute bg-black/10"
          style={{
            width: 2 * scale,
            height: "70%",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* 이름 뱃지 */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{ fontSize: 9 * scale }}
      >
        <span className="px-2 py-0.5 bg-white/90 rounded-full text-gray-600 font-medium shadow-sm border border-gray-100">
          {equipped?.hair?.item.name && equipped?.top?.item.name
            ? "내 아바타"
            : "기본 아바타"}
        </span>
      </div>
    </div>
  );
}
