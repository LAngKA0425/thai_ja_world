"use client";

import type { ShopCategory } from "../types/shop.types";

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "nickname_color",
    label: "닉네임 색상",
    emoji: "🎨",
    itemCount: 0,
  },
  {
    id: "badge",
    label: "배지",
    emoji: "🏅",
    itemCount: 0,
  },
  {
    id: "minihome_skin",
    label: "미니홈 스킨",
    emoji: "🏠",
    itemCount: 0,
  },
  {
    id: "emoji",
    label: "이모지",
    emoji: "😀",
    itemCount: 0,
  },
  {
    id: "miniroom_item",
    label: "미니룸 가구",
    emoji: "🪑",
    itemCount: 0,
  },
];

export const SHOP_SORT_OPTIONS = [
  { id: "newest", label: "최신순" },
  { id: "popular", label: "인기순" },
  { id: "price_low", label: "가격 낮은순" },
  { id: "price_high", label: "가격 높은순" },
];

export const PURCHASE_CONFIRM_MESSAGE = "이 상품을 구매하시겠습니까?";
