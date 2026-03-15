"use client";

import type { MinihomeSkinItem } from "../constants/minihomeSkin.constants";
import type { BgmItem } from "../constants/bgm.constants";

interface EquippedMinihomeSummaryProps {
  equippedSkin?: MinihomeSkinItem;
  skinExpiresAt?: string;
  equippedBgm?: BgmItem;
  bgmExpiresAt?: string;
  totalOwnedSkins?: number;
  totalOwnedBgms?: number;
}

export default function EquippedMinihomeSummary({
  equippedSkin,
  skinExpiresAt,
  equippedBgm,
  bgmExpiresAt,
  totalOwnedSkins = 0,
  totalOwnedBgms = 0,
}: EquippedMinihomeSummaryProps) {
  const skinDaysLeft = skinExpiresAt
    ? Math.max(0, Math.ceil((new Date(skinExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const bgmDaysLeft = bgmExpiresAt
    ? Math.max(0, Math.ceil((new Date(bgmExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50/50 border border-sky-100/60 p-4 space-y-3">
      <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
        <span>🏠</span> 미니홈피 꾸미기
      </h4>

      {/* 스킨 현황 */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/70 border border-sky-100/40">
        {equippedSkin ? (
          <>
            <div
              className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0"
              style={{ background: equippedSkin.gradientCss }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-2xs text-gray-400">적용중인 스킨</p>
              <p className="text-xs font-semibold text-gray-700 truncate">
                {equippedSkin.name}
              </p>
            </div>
            {skinDaysLeft !== null && (
              <span className="text-2xs text-orange-500 font-medium flex-shrink-0">
                {skinDaysLeft}일
              </span>
            )}
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-gray-300">🎨</span>
            </div>
            <div>
              <p className="text-2xs text-gray-400">적용중인 스킨</p>
              <p className="text-xs text-gray-400">없음</p>
            </div>
          </>
        )}
      </div>

      {/* BGM 현황 */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/70 border border-indigo-100/40">
        {equippedBgm ? (
          <>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🎵</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xs text-gray-400">적용중인 BGM</p>
              <p className="text-xs font-semibold text-gray-700 truncate">
                {equippedBgm.title}
              </p>
            </div>
            {bgmDaysLeft !== null && (
              <span className="text-2xs text-orange-500 font-medium flex-shrink-0">
                {bgmDaysLeft}일
              </span>
            )}
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-gray-300">🎵</span>
            </div>
            <div>
              <p className="text-2xs text-gray-400">적용중인 BGM</p>
              <p className="text-xs text-gray-400">없음</p>
            </div>
          </>
        )}
      </div>

      {/* 보유 현황 요약 */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1">
          <span className="text-2xs text-gray-400">스킨</span>
          <span className="text-2xs font-bold text-sky-600">{totalOwnedSkins}개</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xs text-gray-400">BGM</span>
          <span className="text-2xs font-bold text-indigo-600">{totalOwnedBgms}개</span>
        </div>
      </div>
    </div>
  );
}
