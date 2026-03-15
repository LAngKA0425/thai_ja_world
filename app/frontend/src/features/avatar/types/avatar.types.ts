// Avatar customization 타입 정의
export type AvatarCategory = "hair" | "top" | "bottom" | "accessory";

export type DurationType = "permanent" | "timed";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface AvatarItem {
  id: string;
  category: AvatarCategory;
  name: string;
  description?: string;
  previewColor: string;
  previewImage?: string;
  rarity?: ItemRarity;
  priceTp: number;
  isActive: boolean;
  durationType: DurationType;
  durationDays?: number;
}

export interface UserAvatarInventoryItem {
  userId: string;
  itemId: string;
  item: AvatarItem;
  ownedAt: string;
  expiresAt?: string;
  isEquipped: boolean;
}

export interface EquippedAvatar {
  hair?: UserAvatarInventoryItem;
  top?: UserAvatarInventoryItem;
  bottom?: UserAvatarInventoryItem;
  accessory?: UserAvatarInventoryItem;
}

export interface AvatarCategoryTab {
  id: AvatarCategory;
  label: string;
  emoji: string;
  itemCount: number;
}

export interface AvatarEquipRequest {
  itemId: string;
  category: AvatarCategory;
}

export interface AvatarEquipResponse {
  success: boolean;
  equipped: EquippedAvatar;
}
