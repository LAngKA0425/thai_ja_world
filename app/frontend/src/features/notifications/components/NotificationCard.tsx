"use client";

import type { NotificationItem } from "../types/notifications.types";
import { CATEGORY_LABEL_MAP } from "../constants/notificationCategories.constants";
import { timeAgo } from "@/lib/timeago";

interface NotificationCardProps {
  notification: NotificationItem;
  onRead?: (id: string) => void;
}

const CATEGORY_STYLE: Record<string, string> = {
  community: "bg-sky-50 text-sky-600 border-sky-200/50",
  social: "bg-pink-50 text-pink-600 border-pink-200/50",
  quest: "bg-amber-50 text-amber-600 border-amber-200/50",
  reservation: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
};

export default function NotificationCard({
  notification,
  onRead,
}: NotificationCardProps) {
  const { id, category, title, body, icon, isRead, createdAt, ctaLabel } =
    notification;

  const handleClick = () => {
    if (!isRead && onRead) onRead(id);
    // TODO: deepLink 이동 연결
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
        isRead
          ? "bg-white/60 border-gray-100/60"
          : "bg-white border-gray-100/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <span
          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-lg ${
            isRead ? "bg-gray-50 opacity-60" : "bg-gradient-to-br from-primary-50 to-accent-50 shadow-sm"
          }`}
        >
          {icon || "🔔"}
        </span>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 text-2xs font-bold rounded-md border ${
                CATEGORY_STYLE[category] || CATEGORY_STYLE.community
              }`}
            >
              {CATEGORY_LABEL_MAP[category] || category}
            </span>
            <span className="text-2xs text-gray-300 tabular-nums ml-auto flex-shrink-0">
              {timeAgo(createdAt)}
            </span>
          </div>

          <h4
            className={`text-[13px] font-bold leading-snug line-clamp-1 ${
              isRead ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {title}
          </h4>
          <p
            className={`text-xs leading-relaxed mt-0.5 line-clamp-2 ${
              isRead ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {body}
          </p>

          {ctaLabel && !isRead && (
            <span className="inline-flex items-center gap-0.5 text-2xs text-primary-500 font-bold mt-2 group-hover:gap-1.5 transition-all">
              {ctaLabel} <span className="text-sm">→</span>
            </span>
          )}
        </div>

        {/* 읽지 않음 인디케이터 */}
        {!isRead && (
          <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-400 animate-pulse-soft" />
        )}
      </div>
    </button>
  );
}
