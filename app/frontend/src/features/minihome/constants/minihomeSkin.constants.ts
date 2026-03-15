// 미니홈피 스킨 타입 및 시드 데이터

export type SkinType = "solid" | "rainbow" | "neon";

export interface MinihomeSkinItem {
  id: string;
  skinType: SkinType;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  gradientCss: string;
  priceTp: number;
  durationDays: number;
  isActive: boolean;
}

export const SKIN_TYPE_LABELS: Record<SkinType, string> = {
  solid: "단색",
  rainbow: "무지개",
  neon: "네온",
};

export const SKIN_TYPE_EMOJIS: Record<SkinType, string> = {
  solid: "🎨",
  rainbow: "🌈",
  neon: "💡",
};

export const SEED_MINIHOME_SKINS: MinihomeSkinItem[] = [
  // 단색 스킨
  {
    id: "skin-solid-sky",
    skinType: "solid",
    name: "스카이 블루",
    primaryColor: "#38BDF8",
    gradientCss: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
  },
  {
    id: "skin-solid-rose",
    skinType: "solid",
    name: "로즈 핑크",
    primaryColor: "#FB7185",
    gradientCss: "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
  },
  {
    id: "skin-solid-mint",
    skinType: "solid",
    name: "민트 그린",
    primaryColor: "#34D399",
    gradientCss: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
  },
  {
    id: "skin-solid-lavender",
    skinType: "solid",
    name: "라벤더",
    primaryColor: "#A78BFA",
    gradientCss: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
    priceTp: 200,
    durationDays: 30,
    isActive: true,
  },

  // 무지개 스킨
  {
    id: "skin-rainbow-pastel",
    skinType: "rainbow",
    name: "파스텔 레인보우",
    primaryColor: "#F9A8D4",
    secondaryColor: "#93C5FD",
    gradientCss: "linear-gradient(135deg, #F9A8D4 0%, #FDE68A 25%, #6EE7B7 50%, #93C5FD 75%, #C4B5FD 100%)",
    priceTp: 500,
    durationDays: 14,
    isActive: true,
  },
  {
    id: "skin-rainbow-vivid",
    skinType: "rainbow",
    name: "비비드 레인보우",
    primaryColor: "#EF4444",
    secondaryColor: "#8B5CF6",
    gradientCss: "linear-gradient(135deg, #EF4444 0%, #F59E0B 20%, #22C55E 40%, #3B82F6 60%, #8B5CF6 80%, #EC4899 100%)",
    priceTp: 600,
    durationDays: 14,
    isActive: true,
  },

  // 형광 네온 스킨
  {
    id: "skin-neon-cyber",
    skinType: "neon",
    name: "사이버 네온",
    primaryColor: "#00FF88",
    secondaryColor: "#0088FF",
    gradientCss: "linear-gradient(135deg, #00FF88 0%, #0088FF 100%)",
    priceTp: 800,
    durationDays: 7,
    isActive: true,
  },
  {
    id: "skin-neon-magenta",
    skinType: "neon",
    name: "마젠타 글로우",
    primaryColor: "#FF00FF",
    secondaryColor: "#FF6600",
    gradientCss: "linear-gradient(135deg, #FF00FF 0%, #FF6600 100%)",
    priceTp: 800,
    durationDays: 7,
    isActive: true,
  },
  {
    id: "skin-neon-electric",
    skinType: "neon",
    name: "일렉트릭 블루",
    primaryColor: "#00CCFF",
    secondaryColor: "#CC00FF",
    gradientCss: "linear-gradient(135deg, #00CCFF 0%, #CC00FF 100%)",
    priceTp: 1000,
    durationDays: 7,
    isActive: true,
  },
];
