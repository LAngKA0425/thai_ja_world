// ─── 알림 카테고리 ───
export type NotificationCategory = "community" | "social" | "quest" | "reservation";

// ─── 알림 세부 타입 ───
export type NotificationType =
  // community
  | "hot_issue"
  | "new_post"
  | "life_info_update"
  | "market_update"
  // social
  | "comment_received"
  | "guestbook_message"
  | "minihome_visitor"
  | "post_liked"
  // quest
  | "daily_quest_open"
  | "points_available"
  | "quest_reminder"
  | "quest_completed"
  // reservation
  | "reservation_confirmed"
  | "reservation_request"
  | "benefit_available"
  | "reservation_reminder";

// ─── 알림 아이템 ───
export interface NotificationItem {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
  icon?: string;
  ctaLabel?: string;
}

// ─── 알림 설정 ───
export interface NotificationPreference {
  community: boolean;
  social: boolean;
  quest: boolean;
  reservation: boolean;
  pushEnabled: boolean;
  emailEnabled?: boolean;
}

// ─── 알림 목록 응답 ───
export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ─── 알림 카테고리 메타 ───
export interface NotificationCategoryMeta {
  id: NotificationCategory;
  label: string;
  emoji: string;
  color: string;
}
