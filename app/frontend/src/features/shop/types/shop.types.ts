export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "nickname_color" | "badge" | "minihome_skin" | "emoji" | "miniroom_item" | "avatar" | "bgm";
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  durationDays?: number;
}

export interface ShopCategory {
  id: string;
  label: string;
  emoji: string;
  itemCount: number;
}

export interface PurchaseResult {
  success: boolean;
  remainingPoints: number;
  purchasedItem: ShopItem;
}
