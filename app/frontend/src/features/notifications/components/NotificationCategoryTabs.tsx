"use client";

import type { NotificationCategory } from "../types/notifications.types";
import { NOTIFICATION_CATEGORIES } from "../constants/notificationCategories.constants";

interface NotificationCategoryTabsProps {
  active: NotificationCategory | "all";
  onChange: (category: NotificationCategory | "all") => void;
}

export default function NotificationCategoryTabs({
  active,
  onChange,
}: NotificationCategoryTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {/* 전체 탭 */}
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
          active === "all"
            ? "bg-gray-900 text-white shadow-sm"
            : "bg-gray-50/80 text-gray-500 hover:bg-gray-100/80 border border-gray-100/60"
        }`}
      >
        전체
      </button>

      {/* 카테고리 탭 */}
      {NOTIFICATION_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            active === cat.id
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-50/80 text-gray-500 hover:bg-gray-100/80 border border-gray-100/60"
          }`}
        >
          <span className="text-sm">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
