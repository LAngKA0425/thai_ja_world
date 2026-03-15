import { useState, useEffect, useCallback } from "react";
import type { NotificationItem, NotificationCategory } from "../types/notifications.types";
import { MOCK_NOTIFICATIONS } from "../constants/notificationTemplates.constants";

// TODO: 실제 API 연동 시 fetchNotifications / markAsRead 로 교체
// 현재는 mock 데이터 기반 scaffold

export function useNotifications(category?: NotificationCategory) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock: 실제 API 연동 전 scaffold
    const filtered = category
      ? MOCK_NOTIFICATIONS.filter((n) => n.category === category)
      : MOCK_NOTIFICATIONS;
    setNotifications(filtered);
    setUnreadCount(filtered.filter((n) => !n.isRead).length);
    setLoading(false);
  }, [category]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
