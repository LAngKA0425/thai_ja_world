import type { NicknameColorOption } from "../types/points.types";

// TODO: 실제 상점 데이터는 백엔드에서 관리 — 여기는 프론트 미리보기용 상수
export const POINT_UNIT = "TP";

export const NICKNAME_COLOR_OPTIONS: NicknameColorOption[] = [
  { id: "nc-red", label: "레드", colorClass: "text-red-500", price: 500 },
  { id: "nc-blue", label: "블루", colorClass: "text-blue-500", price: 500 },
  { id: "nc-emerald", label: "에메랄드", colorClass: "text-emerald-500", price: 500 },
  { id: "nc-purple", label: "퍼플", colorClass: "text-purple-500", price: 700 },
  { id: "nc-gold", label: "골드", colorClass: "text-amber-500", price: 1000 },
  { id: "nc-rainbow", label: "레인보우", colorClass: "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent", price: 2000 },
];

export const POINT_EARN_RULES = {
  daily_login: 10,
  write_post: 20,
  receive_like: 5,
  write_comment: 5,
  first_post_of_day: 30,
  report_accepted: 50,
};

export const POINT_SHOP_CATEGORIES = [
  { id: "nickname_color", label: "닉네임 색상", emoji: "🎨" },
  { id: "badge", label: "뱃지", emoji: "🏅" },
  { id: "minihome_skin", label: "미니홈피 스킨", emoji: "🎨" },
  { id: "emoji", label: "특수 이모지", emoji: "✨" },
] as const;
