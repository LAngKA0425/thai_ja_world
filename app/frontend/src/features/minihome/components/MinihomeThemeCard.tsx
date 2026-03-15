"use client";

import type { SkinType } from "../constants/minihomeSkin.constants";
import { SKIN_TYPE_LABELS, SKIN_TYPE_EMOJIS, SEED_MINIHOME_SKINS } from "../constants/minihomeSkin.constants";

interface MinihomeThemeCardProps {
  skinType: SkinType;
  onViewAll?: (skinType: SkinType) => void;
}

export default function MinihomeThemeCard({
  skinType,
  onViewAll,
}: MinihomeThemeCardProps) {
  const skins = SEED_MINIHOME_SKINS.filter((s) => s.skinType === skinType);
  const label = SKIN_TYPE_LABELS[skinType];
  const emoji = SKIN_TYPE_EMOJIS[skinType];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-bold text-gray-800">{label} 스킨</span>
          <span className="text-2xs text-gray-400">({skins.length})</span>
        </div>
        {onViewAll && (
          <button
            onClick={() => onViewAll(skinType)}
            className="text-2xs text-blue-500 hover:text-blue-600 font-medium"
          >
            전체보기 →
          </button>
        )}
      </div>

      <div className="p-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {skins.map((skin) => (
            <div key={skin.id} className="flex-shrink-0 w-20">
              <div
                className="w-20 h-14 rounded-lg mb-1.5 shadow-sm"
                style={{ background: skin.gradientCss }}
              >
                {skinType === "neon" && (
                  <div
                    className="w-full h-full rounded-lg opacity-40"
                    style={{
                      background: `radial-gradient(circle, ${skin.primaryColor} 0%, transparent 70%)`,
                    }}
                  />
                )}
              </div>
              <p className="text-2xs font-medium text-gray-700 text-center truncate">
                {skin.name}
              </p>
              <p className="text-2xs text-yellow-600 text-center font-bold">
                {skin.priceTp} TP
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
