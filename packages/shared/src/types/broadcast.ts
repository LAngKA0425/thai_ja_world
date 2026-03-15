export enum BroadcastType {
  NORMAL = "NORMAL",
  PREMIUM = "PREMIUM",
}

export interface BroadcastItem {
  id: string;
  name: string;
  type: BroadcastType;
  price: number;
  duration: number;
  maxLength: number;
  cooldownMs: number;
  description?: string;
}

export interface BroadcastMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  type: BroadcastType;
  sentAt: Date;
  expiresAt: Date;
}

export interface BroadcastLog {
  id: string;
  userId: string;
  message: string;
  type: BroadcastType;
  itemId?: string;
  sentAt: Date;
}

export interface ActiveBroadcast {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  type: BroadcastType;
  sentAt: Date;
  expiresAt: Date;
  timeRemainingMs: number;
}
