// TODO: 백엔드 API 연동 시 실제 스키마에 맞춰 확장
export interface PointBalance {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  lastUpdated: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: "earn" | "spend" | "refund";
  amount: number;
  reason: string;
  createdAt: string;
}

export interface PointShopItem {
  id: string;
  name: string;
  description: string;
  category: "nickname_color" | "badge" | "minihome_skin" | "emoji";
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export type NicknameColorOption = {
  id: string;
  label: string;
  colorClass: string;
  price: number;
};

export interface PointHistoryEntry {
  id: string;
  userId: string;
  type: "earn" | "spend" | "refund";
  amount: number;
  description: string;
  createdAt: string;
}
