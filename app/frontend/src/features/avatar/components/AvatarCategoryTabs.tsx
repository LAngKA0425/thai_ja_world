"use client";

import type { AvatarCategory } from "../types/avatar.types";
import { AVATAR_CATEGORIES } from "../constants/avatarCategories.constants";

interface AvatarCategoryTabsProps {
  activeCategory: AvatarCategory;
  onCategoryChange: (category: AvatarCategory) => void;
  categoryCounts?: Record<AvatarCategory, number>;
}

export default function AvatarCategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: AvatarCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {AVATAR_CATEGORIES.map((cat) => {
        const count = categoryCounts?.[cat.id] ?? cat.itemCount;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{cat.emoji}</span>
            <span className="font-medium">{cat.label}</span>
            {count > 0 && (
              <span
                className={`text-2xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20" : "bg-gray-200"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
