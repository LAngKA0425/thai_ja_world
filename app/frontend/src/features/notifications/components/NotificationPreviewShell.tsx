"use client";

import { MOCK_NOTIFICATIONS } from "../constants/notificationTemplates.constants";
import { CATEGORY_LABEL_MAP } from "../constants/notificationCategories.constants";
import { timeAgo } from "@/lib/timeago";

/**
 * 홈/프로필/미니홈피 어디에든 붙일 수 있는 최근 알림 미리보기 섹션
 * 최근 알림 2~3개를 카드 형태로 표시
 */
export default function NotificationPreviewShell() {
  // TODO: 실제 API 연동 시 useNotifications 훅 사용
  const recentNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).slice(0, 3);

  if (recentNotifs.length === 0) return null;

  return (
    <section className="mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg text-sm">🔔</span>
          새 소식
        </h2>
        <span className="inline-flex items-center gap-1 text-2xs text-primary-400 font-semibold bg-primary-50/80 px-2.5 py-1 rounded-full">
          {recentNotifs.length}건
        </span>
      </div>

      <div className="space-y-2">
        {recentNotifs.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl text-base shadow-sm">
              {n.icon || "🔔"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-2xs font-bold text-primary-500">
                  {CATEGORY_LABEL_MAP[n.category]}
                </span>
                <span className="text-2xs text-gray-300 tabular-nums">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="text-xs font-bold text-gray-700 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {n.title}
              </p>
              <p className="text-2xs text-gray-400 line-clamp-1 mt-0.5">{n.body}</p>
            </div>
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-400 animate-pulse-soft" />
          </div>
        ))}
      </div>
    </section>
  );
}
