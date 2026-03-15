export enum ShopCategory {
  STARTER_PACK = "STARTER_PACK",
  COSTUME = "COSTUME",
  BROADCAST_ITEM = "BROADCAST_ITEM",
  BACKGROUND = "BACKGROUND",
  FURNITURE = "FURNITURE",
}

export enum CurrencyType {
  GEMS = "GEMS",
  POINTS = "POINTS",
  /** Style Points - spendable decoration-only currency (maps to GEMS internally) */
  STYLE_POINTS = "STYLE_POINTS",
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  currency: CurrencyType;
  imageUrl: string;
  isAvailable: boolean;
  isLimited?: boolean;
  limitedQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  item?: ShopItem;
  quantity: number;
  acquiredAt: Date;
  expiresAt?: Date;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  inventoryItemId?: string;
  newBalance?: {
    gems: number;
    points: number;
  };
  error?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  itemId: string;
  item?: ShopItem;
  amount: number;
  currency: CurrencyType;
  transactionType: "PURCHASE" | "REWARD" | "REFUND" | "ADMIN_ADJUSTMENT";
  status: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";
  createdAt: Date;
}
