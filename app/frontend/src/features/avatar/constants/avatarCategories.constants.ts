import type { AvatarCategoryTab, AvatarItem } from "../types/avatar.types";

export const AVATAR_CATEGORIES: AvatarCategoryTab[] = [
  { id: "hair", label: "머리", emoji: "💇", itemCount: 0 },
  { id: "top", label: "상의", emoji: "👕", itemCount: 0 },
  { id: "bottom", label: "하의", emoji: "👖", itemCount: 0 },
  { id: "accessory", label: "악세사리", emoji: "💍", itemCount: 0 },
];

export const AVATAR_CATEGORY_LABELS: Record<string, string> = {
  hair: "머리",
  top: "상의",
  bottom: "하의",
  accessory: "악세사리",
};

export const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400 bg-gray-100",
  rare: "text-blue-500 bg-blue-50",
  epic: "text-purple-500 bg-purple-50",
  legendary: "text-amber-500 bg-amber-50",
};

export const RARITY_LABELS: Record<string, string> = {
  common: "일반",
  rare: "레어",
  epic: "에픽",
  legendary: "전설",
};

// 기본 아바타 색상 (이미지 없을 때 placeholder)
export const DEFAULT_AVATAR_COLORS: Record<string, string> = {
  hair: "#4A3728",
  top: "#3B82F6",
  bottom: "#1E40AF",
  accessory: "#F59E0B",
};

// 시드 데이터: 프론트 미리보기용 아바타 아이템
export const SEED_AVATAR_ITEMS: AvatarItem[] = [
  // 머리
  { id: "hair-001", category: "hair", name: "기본 헤어", previewColor: "#4A3728", priceTp: 0, isActive: true, durationType: "permanent" },
  { id: "hair-002", category: "hair", name: "포니테일", previewColor: "#8B5E3C", priceTp: 100, isActive: true, durationType: "permanent", rarity: "common" },
  { id: "hair-003", category: "hair", name: "숏컷", previewColor: "#2C1810", priceTp: 150, isActive: true, durationType: "permanent", rarity: "rare" },
  { id: "hair-004", category: "hair", name: "웨이브 롱", previewColor: "#D4A574", priceTp: 300, isActive: true, durationType: "timed", durationDays: 30, rarity: "epic" },
  { id: "hair-005", category: "hair", name: "레인보우 헤어", previewColor: "#FF6B6B", priceTp: 500, isActive: true, durationType: "timed", durationDays: 7, rarity: "legendary" },
  // 상의
  { id: "top-001", category: "top", name: "기본 티셔츠", previewColor: "#3B82F6", priceTp: 0, isActive: true, durationType: "permanent" },
  { id: "top-002", category: "top", name: "후드티", previewColor: "#6366F1", priceTp: 120, isActive: true, durationType: "permanent", rarity: "common" },
  { id: "top-003", category: "top", name: "가죽 재킷", previewColor: "#1C1917", priceTp: 250, isActive: true, durationType: "permanent", rarity: "rare" },
  { id: "top-004", category: "top", name: "형광 조끼", previewColor: "#22D3EE", priceTp: 400, isActive: true, durationType: "timed", durationDays: 14, rarity: "epic" },
  // 하의
  { id: "bottom-001", category: "bottom", name: "기본 청바지", previewColor: "#1E40AF", priceTp: 0, isActive: true, durationType: "permanent" },
  { id: "bottom-002", category: "bottom", name: "카고팬츠", previewColor: "#78716C", priceTp: 130, isActive: true, durationType: "permanent", rarity: "common" },
  { id: "bottom-003", category: "bottom", name: "반바지", previewColor: "#059669", priceTp: 100, isActive: true, durationType: "permanent", rarity: "rare" },
  // 악세사리
  { id: "acc-001", category: "accessory", name: "선글라스", previewColor: "#171717", priceTp: 200, isActive: true, durationType: "permanent", rarity: "common" },
  { id: "acc-002", category: "accessory", name: "왕관", previewColor: "#F59E0B", priceTp: 800, isActive: true, durationType: "timed", durationDays: 30, rarity: "legendary" },
  { id: "acc-003", category: "accessory", name: "귀걸이", previewColor: "#EC4899", priceTp: 150, isActive: true, durationType: "permanent", rarity: "rare" },
];
