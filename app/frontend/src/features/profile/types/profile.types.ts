// TODO: 백엔드 확장 시 실제 스키마에 맞춰 업데이트
export interface ProfileDecoration {
  userId: string;
  nicknameColorId?: string;
  badgeIds: string[];
  titleText?: string;
  frameId?: string;
}

export interface ProfileBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt?: string;
}

export interface ExtendedProfile {
  id: string;
  nickname: string;
  email: string;
  role: string;
  bio?: string;
  decoration?: ProfileDecoration;
  badges: ProfileBadge[];
  pointBalance: number;
  minihomeId?: string;
  joinedAt: string;
}
