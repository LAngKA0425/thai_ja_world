import type { ReservationStatusType } from "../types/reservations.types";

// TODO: 실제 업체 데이터는 백엔드에서 관리
export const RESERVATION_STATUS_MAP: Record<ReservationStatusType, { label: string; color: string; bgColor: string }> = {
  pending: { label: "대기중", color: "text-amber-600", bgColor: "bg-amber-50" },
  confirmed: { label: "확정", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  cancelled: { label: "취소됨", color: "text-gray-500", bgColor: "bg-gray-50" },
  completed: { label: "완료", color: "text-primary-600", bgColor: "bg-primary-50" },
  no_show: { label: "노쇼", color: "text-red-500", bgColor: "bg-red-50" },
};

export const RESERVATION_CATEGORIES = [
  { id: "massage", label: "마사지", emoji: "💆" },
  { id: "restaurant", label: "맛집", emoji: "🍽️" },
  { id: "salon", label: "미용실", emoji: "💇" },
  { id: "tour", label: "투어", emoji: "🏝️" },
  { id: "other", label: "기타", emoji: "📌" },
] as const;

export const POPULAR_AREAS = [
  "방콕 아속",
  "방콕 실롬",
  "방콕 수쿰빗",
  "파타야",
  "치앙마이",
  "푸켓",
  "코사무이",
];
