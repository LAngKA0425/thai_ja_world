"use client";

import { useState } from "react";
import type { NotificationCategory } from "../types/notifications.types";
import { useNotifications } from "../hooks/useNotifications";
import NotificationCard from "./NotificationCard";
import NotificationCategoryTabs from "./NotificationCategoryTabs";
import NotificationEmptyState from "./NotificationEmptyState";

export default function NotificationList() {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | "all">("all");
  const category = activeCategory === "all" ? undefined : activeCategory;
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications(category);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-gray-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg text-sm">🔔</span>
          알림
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 bg-primary-50 rounded-full text-2xs font-bold text-primary-500">
              {unreadCount}건
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-2xs text-gray-400 hover:text-gray-600 font-semibold transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 카테고리 탭 */}
      <NotificationCategoryTabs active={activeCategory} onChange={setActiveCategory} />

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
