// 프론트 미리보기용 시드 상품 데이터
// 실제 서비스에서는 백엔드 API에서 가져옴

export interface SeedShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  previewColor?: string;
  isAvailable: boolean;
  durationDays?: number;
  rarity?: string;
}

export const SEED_SHOP_ITEMS: SeedShopItem[] = [
  // 아바타 - 머리
  { id: "shop-hair-001", name: "포니테일", description: "깔끔한 포니테일 헤어스타일", category: "avatar_hair", price: 100, previewColor: "#8B5E3C", isAvailable: true },
  { id: "shop-hair-002", name: "숏컷", description: "시원한 숏컷 스타일", category: "avatar_hair", price: 150, previewColor: "#2C1810", isAvailable: true, rarity: "rare" },
  { id: "shop-hair-003", name: "레인보우 헤어", description: "무지개빛 특별 헤어", category: "avatar_hair", price: 500, previewColor: "#FF6B6B", isAvailable: true, durationDays: 7, rarity: "legendary" },

  // 아바타 - 상의
  { id: "shop-top-001", name: "후드티", description: "편안한 후드티", category: "avatar_top", price: 120, previewColor: "#6366F1", isAvailable: true },
  { id: "shop-top-002", name: "가죽 재킷", description: "멋진 가죽 재킷", category: "avatar_top", price: 250, previewColor: "#1C1917", isAvailable: true, rarity: "rare" },

  // 아바타 - 하의
  { id: "shop-bottom-001", name: "카고팬츠", description: "실용적인 카고팬츠", category: "avatar_bottom", price: 130, previewColor: "#78716C", isAvailable: true },

  // 악세사리
  { id: "shop-acc-001", name: "선글라스", description: "쿨한 선글라스", category: "avatar_accessory", price: 200, previewColor: "#171717", isAvailable: true },
  { id: "shop-acc-002", name: "왕관", description: "화려한 왕관", category: "avatar_accessory", price: 800, previewColor: "#F59E0B", isAvailable: true, durationDays: 30, rarity: "legendary" },

  // 미니홈 스킨
  { id: "shop-skin-001", name: "선셋 스킨", description: "노을빛 따뜻한 스킨", category: "minihome_skin", price: 300, previewColor: "#F97316", isAvailable: true, durationDays: 30 },
  { id: "shop-skin-002", name: "네온 퍼플", description: "형광 네온 보라색", category: "minihome_skin", price: 500, previewColor: "#A855F7", isAvailable: true, durationDays: 14, rarity: "epic" },
  { id: "shop-skin-003", name: "레인보우 스킨", description: "무지개빛 그라데이션", category: "minihome_skin", price: 800, previewColor: "#EC4899", isAvailable: true, durationDays: 7, rarity: "legendary" },

  // BGM
  { id: "shop-bgm-001", name: "봄날의 소풍", description: "경쾌한 피아노 멜로디", category: "bgm", price: 200, isAvailable: true, durationDays: 30 },
  { id: "shop-bgm-002", name: "별빛 야경", description: "잔잔한 재즈 BGM", category: "bgm", price: 250, isAvailable: true, durationDays: 30 },
  { id: "shop-bgm-003", name: "레트로 시티", description: "80년대 감성 신디사이저", category: "bgm", price: 350, isAvailable: true, durationDays: 14, rarity: "rare" },
];
