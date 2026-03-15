import type { ShopCategory } from "../types/shop.types";

// 확장된 카테고리 (아바타 + 미니홈피 스킨 + BGM 포함)
export const EXTENDED_SHOP_CATEGORIES: ShopCategory[] = [
  { id: "avatar_hair", label: "아바타 머리", emoji: "💇", itemCount: 0 },
  { id: "avatar_top", label: "아바타 상의", emoji: "👕", itemCount: 0 },
  { id: "avatar_bottom", label: "아바타 하의", emoji: "👖", itemCount: 0 },
  { id: "avatar_accessory", label: "악세사리", emoji: "💍", itemCount: 0 },
  { id: "minihome_skin", label: "미니홈 스킨", emoji: "🏠", itemCount: 0 },
  { id: "bgm", label: "BGM", emoji: "🎵", itemCount: 0 },
  { id: "nickname_color", label: "닉네임 색상", emoji: "🎨", itemCount: 0 },
  { id: "badge", label: "배지", emoji: "🏅", itemCount: 0 },
  { id: "emoji", label: "이모지", emoji: "😀", itemCount: 0 },
  { id: "miniroom_item", label: "미니룸 가구", emoji: "🪑", itemCount: 0 },
];

export type ExtendedShopCategoryId =
  | "avatar_hair"
  | "avatar_top"
  | "avatar_bottom"
  | "avatar_accessory"
  | "minihome_skin"
  | "bgm"
  | "nickname_color"
  | "badge"
  | "emoji"
  | "miniroom_item";
