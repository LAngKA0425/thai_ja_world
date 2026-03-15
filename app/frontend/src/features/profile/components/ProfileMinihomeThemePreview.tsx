"use client";

import type { MinihomeSkinItem } from "@/features/minihome/constants/minihomeSkin.constants";
import type { BgmItem } from "@/features/minihome/constants/bgm.constants";

interface ProfileMinihomeThemePreviewProps {
  equippedSkin?: MinihomeSkinItem;
  equippedBgm?: BgmItem;
  skinExpiresAt?: string;
  bgmExpiresAt?: string;
  onCustomize?: () => void;
}

export default function ProfileMinihomeThemePreview({
  equippedSkin,
  equippedBgm,
  skinExpiresAt,
  bgmExpiresAt,
  onCustomize,
}: ProfileMinihomeThemePreviewProps) {
  const skinDaysLeft = skinExpiresAt
    ? Math.max(0, Math.ceil((new Date(skinExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const bgmDaysLeft = bgmExpiresAt
    ? Math.max(0, Math.ceil((new Date(bgmExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50/40 border border-sky-100/50 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <span>🏠</span> 미니홈피 테마
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

      <div className="space-y-2">
        {/* 스킨 */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/60 border border-gray-100/50">
          {equippedSkin ? (
            <div
              className="w-8 h-8 rounded-lg shadow-inner flex-shrink-0"
              style={{ background: equippedSkin.gradientCss }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-gray-300">🎨</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-2xs text-gray-400">스킨</p>
            <p className="text-2xs font-semibold text-gray-600 truncate">
              {equippedSkin?.name ?? "기본 스킨"}
            </p>
          </div>
          {skinDaysLeft !== null && (
            <span className="text-2xs text-orange-500 font-medium flex-shrink-0">
              {skinDaysLeft}일
            </span>
          )}
        </div>

        {/* BGM */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/60 border border-gray-100/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">🎵</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xs text-gray-400">BGM</p>
            <p className="text-2xs font-semibold text-gray-600 truncate">
              {equippedBgm?.title ?? "미설정"}
            </p>
          </div>
          {bgmDaysLeft !== null && (
            <span className="text-2xs text-orange-500 font-medium flex-shrink-0">
              {bgmDaysLeft}일
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
