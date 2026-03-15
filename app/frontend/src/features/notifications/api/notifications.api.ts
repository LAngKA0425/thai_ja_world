import { apiFetch } from "@/lib/api";
import type {
  NotificationListResponse,
  NotificationPreference,
} from "../types/notifications.types";

const PREFIX = "/notifications";

export async function fetchNotifications(params?: {
  category?: string;
  cursor?: string;
  limit?: number;
}): Promise<NotificationListResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<NotificationListResponse>(`${PREFIX}?${qs}`);
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(`${PREFIX}/unread-count`);
}

export async function markAsRead(notificationId: string): Promise<void> {
  return apiFetch(`${PREFIX}/${notificationId}/read`, { method: "POST" });
}

export async function markAllAsRead(): Promise<void> {
  return apiFetch(`${PREFIX}/read-all`, { method: "POST" });
}

export async function fetchPreferences(): Promise<NotificationPreference> {
  return apiFetch<NotificationPreference>(`${PREFIX}/preferences`);
}

export async function updatePreferences(
  prefs: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  return apiFetch<NotificationPreference>(`${PREFIX}/preferences`, {
    method: "PATCH",
    body: JSON.stringify(prefs),
  });
}
