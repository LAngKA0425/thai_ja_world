"use client";

import { SEED_AVATAR_ITEMS } from "@/features/avatar/constants/avatarCategories.constants";
import { SEED_MINIHOME_SKINS } from "@/features/minihome/constants/minihomeSkin.constants";

export function AvatarShopAdminOverview() {
  // scaffold: 시드 데이터 기반 통계 (추후 API 연동)
  const avatarItems = SEED_AVATAR_ITEMS;
  const skins = SEED_MINIHOME_SKINS;

  const hairCount = avatarItems.filter((i) => i.category === "hair").length;
  const topCount = avatarItems.filter((i) => i.category === "top").length;
  const bottomCount = avatarItems.filter((i) => i.category === "bottom").length;
  const accCount = avatarItems.filter((i) => i.category === "accessory").length;
  const timedCount = avatarItems.filter((i) => i.durationType === "timed").length;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-gray-900">
        아바타 · 스킨 현황
      </h2>

      {/* 아바타 아이템 통계 */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">아바타 아이템</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
            <p className="text-xs text-gray-500">전체</p>
            <p className="text-xl font-bold text-blue-900">{avatarItems.length}</p>
            <p className="text-2xs text-gray-400">개</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 p-3">
            <p className="text-xs text-gray-500">기간제</p>
            <p className="text-xl font-bold text-amber-900">{timedCount}</p>
            <p className="text-2xs text-gray-400">개</p>
          </div>
        </div>
      </div>

      {/* 카테고리별 */}
      <div className="mb-6 border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">카테고리별</h3>
        <div className="space-y-2">
          {[
            { label: "머리", emoji: "💇", count: hairCount },
            { label: "상의", emoji: "👕", count: topCount },
            { label: "하의", emoji: "👖", count: bottomCount },
            { label: "악세사리", emoji: "💍", count: accCount },
          ].map(({ label, emoji, count }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{emoji}</span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{count}개</span>
            </div>
          ))}
        </div>
      </div>

      {/* 미니홈피 스킨 통계 */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">미니홈피 스킨</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 p-3 text-center">
            <p className="text-2xs text-gray-500">단색</p>
            <p className="text-lg font-bold text-sky-700">
              {skins.filter((s) => s.skinType === "solid").length}
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-3 text-center">
            <p className="text-2xs text-gray-500">무지개</p>
            <p className="text-lg font-bold text-pink-700">
              {skins.filter((s) => s.skinType === "rainbow").length}
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-3 text-center">
            <p className="text-2xs text-gray-500">네온</p>
            <p className="text-lg font-bold text-purple-700">
              {skins.filter((s) => s.skinType === "neon").length}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">총 스킨</span>
            <span className="text-sm font-bold text-gray-900">{skins.length}개</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xs text-gray-400">모든 스킨 기간제 구조</span>
            <span className="text-2xs text-green-500 font-medium">✓ 적용됨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
