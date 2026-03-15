import type { CurrencyType } from "../types/shop";

export interface PurchaseDTO {
  userId: string;
  itemId: string;
  quantity?: number;
}

export interface PurchaseResponseDTO {
  success: boolean;
  message: string;
  transactionId?: string;
  inventoryItemId?: string;
  newBalance?: {
    gems: number;
    points: number;
  };
  error?: string;
  errorCode?: string;
}

export interface BulkPurchaseDTO {
  userId: string;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export interface BulkPurchaseResponseDTO {
  success: boolean;
  message: string;
  transactionId?: string;
  purchasedItems?: Array<{
    itemId: string;
    quantity: number;
    inventoryItemId: string;
  }>;
  newBalance?: {
    gems: number;
    points: number;
  };
  error?: string;
}

export interface ShopItemDTO {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: CurrencyType;
  imageUrl: string;
  isAvailable: boolean;
  isLimited?: boolean;
  limitedQuantity?: number;
}

export interface InventoryDTO {
  userId: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    category: string;
    imageUrl: string;
    acquiredAt: Date;
    expiresAt?: Date;
  }>;
  totalItems: number;
}

export interface RefundDTO {
  transactionId: string;
  userId: string;
  reason: string;
}

export interface RefundResponseDTO {
  success: boolean;
  message: string;
  refundAmount?: number;
  newBalance?: {
    gems: number;
    points: number;
  };
  error?: string;
}
