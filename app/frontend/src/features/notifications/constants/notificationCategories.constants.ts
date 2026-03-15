import type { NotificationCategoryMeta } from "../types/notifications.types";

export const NOTIFICATION_CATEGORIES: NotificationCategoryMeta[] = [
  { id: "community", label: "커뮤니티", emoji: "📢", color: "from-sky-50 to-blue-50 border-sky-200/40 text-sky-600" },
  { id: "social", label: "소셜", emoji: "💬", color: "from-pink-50 to-rose-50 border-pink-200/40 text-pink-600" },
  { id: "quest", label: "퀘스트", emoji: "⚡", color: "from-amber-50 to-yellow-50 border-amber-200/40 text-amber-600" },
  { id: "reservation", label: "예약", emoji: "📅", color: "from-emerald-50 to-teal-50 border-emerald-200/40 text-emerald-600" },
];

export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  community: "📢",
  social: "💬",
  quest: "⚡",
  reservation: "📅",
};

export const CATEGORY_LABEL_MAP: Record<string, string> = {
  community: "커뮤니티",
  social: "소셜",
  quest: "퀘스트",
  reservation: "예약",
};
