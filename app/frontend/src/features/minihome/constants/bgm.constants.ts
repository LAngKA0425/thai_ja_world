// BGM 시스템 상수 및 시드 데이터

export interface BgmItem {
  id: string;
  title: string;
  artist?: string;
  previewUrl?: string;
  priceTp: number;
  durationDays: number;
  isActive: boolean;
  genre?: string;
}

export interface UserBgmItem {
  userId: string;
  bgmId: string;
  bgm: BgmItem;
  ownedAt: string;
  expiresAt?: string;
  isEquipped: boolean;
}

export const BGM_GENRES = [
  { id: "all", label: "전체", emoji: "🎵" },
  { id: "piano", label: "피아노", emoji: "🎹" },
  { id: "jazz", label: "재즈", emoji: "🎷" },
  { id: "retro", label: "레트로", emoji: "📻" },
  { id: "lofi", label: "로파이", emoji: "🎧" },
  { id: "acoustic", label: "어쿠스틱", emoji: "🎸" },
] as const;

// 시드 BGM 데이터 (프론트 미리보기용)
export const SEED_BGM_ITEMS: BgmItem[] = [
  {
    id: "bgm-001",
    title: "봄날의 소풍",
    artist: "피아노맨",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
    genre: "piano",
  },
  {
    id: "bgm-002",
    title: "별빛 야경",
    artist: "재즈캣",
    priceTp: 250,
    durationDays: 30,
    isActive: true,
    genre: "jazz",
  },
  {
    id: "bgm-003",
    title: "레트로 시티",
    artist: "신디웨이브",
    priceTp: 350,
    durationDays: 14,
    isActive: true,
    genre: "retro",
  },
  {
    id: "bgm-004",
    title: "빗소리 카페",
    artist: "로파이보이",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
    genre: "lofi",
  },
  {
    id: "bgm-005",
    title: "기타 선율",
    artist: "어쿠스틱걸",
    priceTp: 300,
    durationDays: 30,
    isActive: true,
    genre: "acoustic",
  },
  {
    id: "bgm-006",
    title: "한여름의 추억",
    artist: "피아노맨",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
    genre: "piano",
  },
  {
    id: "bgm-007",
    title: "미드나잇 스윙",
    artist: "재즈캣",
    priceTp: 400,
    durationDays: 14,
    isActive: true,
    genre: "jazz",
  },
  {
    id: "bgm-008",
    title: "네온사인 드라이브",
    artist: "신디웨이브",
    priceTp: 500,
    durationDays: 7,
    isActive: true,
    genre: "retro",
  },
];
