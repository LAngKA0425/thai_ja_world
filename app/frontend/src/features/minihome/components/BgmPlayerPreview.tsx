"use client";

import { useState } from "react";
import type { BgmItem, UserBgmItem } from "../constants/bgm.constants";
import { SEED_BGM_ITEMS } from "../constants/bgm.constants";

interface BgmPlayerPreviewProps {
  equippedBgm?: UserBgmItem;
  ownedBgms?: UserBgmItem[];
  onPurchase?: (bgmId: string) => void;
  onEquip?: (bgmId: string) => void;
  userPoints?: number;
}

export default function BgmPlayerPreview({
  equippedBgm,
  ownedBgms = [],
  onPurchase,
  onEquip,
  userPoints = 0,
}: BgmPlayerPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentBgm = equippedBgm?.bgm;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-2xl border border-indigo-100/60 overflow-hidden shadow-sm">
      {/* 싸이월드 감성 플레이어 헤더 */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-100/80 to-violet-100/60 border-b border-indigo-100/40">
        <span className="text-sm">🎵</span>
        <span className="text-xs font-bold text-indigo-700">BGM Player</span>
        <span className="ml-auto text-2xs text-indigo-400 font-semibold">
          {ownedBgms.length > 0 ? `${ownedBgms.length}곡 보유` : "준비중"}
        </span>
      </div>

      {/* 현재 재생 영역 */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-indigo-100/40 shadow-inner">
          {/* 재생 버튼 */}
          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105">
            <span className="text-white text-sm ml-0.5">▶</span>
          </button>

          {/* 곡 정보 */}
          <div className="flex-1 min-w-0">
            {currentBgm ? (
              <>
                <p className="text-xs font-semibold text-gray-700 truncate">
                  {currentBgm.title}
                </p>
                <p className="text-2xs text-gray-400">
                  {currentBgm.artist ?? "Unknown Artist"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500">
                  BGM을 설정해보세요
                </p>
                <p className="text-2xs text-gray-400">
                  상점에서 BGM을 구매하고 적용하세요
                </p>
              </>
            )}
          </div>

          {/* 기간 표시 */}
          {equippedBgm?.expiresAt && (
            <div className="text-right">
              <span className="text-2xs text-orange-500 font-medium">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(equippedBgm.expiresAt).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}
                일
              </span>
            </div>
          )}
        </div>

        {/* 프로그레스 바 (장식용) */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-2xs text-gray-400">0:00</span>
          <div className="flex-1 h-1 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
          </div>
          <span className="text-2xs text-gray-400">3:45</span>
        </div>

        {/* 컨트롤 */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <button className="text-gray-400 hover:text-indigo-500 transition-colors">
            <span className="text-xs">⏮</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shadow-sm">
            <span className="text-xs ml-0.5">▶</span>
          </button>
          <button className="text-gray-400 hover:text-indigo-500 transition-colors">
            <span className="text-xs">⏭</span>
          </button>
        </div>
      </div>

      {/* 확장 - 보유 BGM 목록 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 border-t border-indigo-100/40 text-2xs text-indigo-500 font-medium hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1"
      >
        {isExpanded ? "접기" : "보유 BGM 목록 보기"}
        <span className="text-xs">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {ownedBgms.length > 0 ? (
            ownedBgms.map((owned) => (
              <div
                key={owned.bgmId}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  owned.isEquipped
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-white/50 border-gray-100 hover:border-indigo-100"
                }`}
              >
                <span className="text-sm">{owned.isEquipped ? "🎵" : "🎶"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs font-semibold text-gray-700 truncate">
                    {owned.bgm.title}
                  </p>
                  <p className="text-2xs text-gray-400">{owned.bgm.artist}</p>
                </div>
                {owned.isEquipped ? (
                  <span className="text-2xs text-indigo-600 font-bold">재생중</span>
                ) : (
                  <button
                    onClick={() => onEquip?.(owned.bgmId)}
                    className="text-2xs text-blue-500 font-medium hover:text-blue-600"
                  >
                    적용
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-2xs text-gray-400">
                보유한 BGM이 없습니다
              </p>
              <p className="text-2xs text-indigo-400 mt-1">
                상점에서 BGM을 구매해보세요
              </p>
            </div>
          )}

          {/* BGM 상점 미리보기 */}
          <div className="border-t border-indigo-100/40 pt-3 mt-3">
            <p className="text-2xs font-bold text-gray-500 mb-2">추천 BGM</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {SEED_BGM_ITEMS.slice(0, 4).map((bgm) => (
                <div
                  key={bgm.id}
                  className="flex-shrink-0 w-28 p-2 rounded-lg bg-white/60 border border-gray-100"
                >
                  <p className="text-2xs font-semibold text-gray-700 truncate">
                    {bgm.title}
                  </p>
                  <p className="text-2xs text-gray-400 truncate">{bgm.artist}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xs font-bold text-yellow-600">
                      {bgm.priceTp} TP
                    </span>
                    <span className="text-2xs text-blue-400">{bgm.durationDays}일</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
