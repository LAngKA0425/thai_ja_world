export enum MinihomeTheme {
  DEFAULT = "DEFAULT",
  PASTEL = "PASTEL",
  DARK = "DARK",
  COZY = "COZY",
  MODERN = "MODERN",
  NATURAL = "NATURAL",
}

export interface MinihomeSlot {
  id: string;
  slotIndex: number;
  itemId?: string;
  itemName?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface GuestbookEntry {
  id: string;
  minihomeId: string;
  visitorId: string;
  visitorNickname: string;
  message: string;
  createdAt: Date;
}

export interface Minihome {
  id: string;
  userId: string;
  theme: MinihomeTheme;
  backgroundItemId?: string;
  backgroundItemName?: string;
  slots: MinihomeSlot[];
  guestbookEntries?: GuestbookEntry[];
  visitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MinihomeVisit {
  minihomeId: string;
  ownerId: string;
  ownerNickname: string;
  theme: MinihomeTheme;
  slots: MinihomeSlot[];
  guestbookCount: number;
  canWrite: boolean;
}
