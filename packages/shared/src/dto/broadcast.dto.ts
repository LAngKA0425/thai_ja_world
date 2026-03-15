import type { BroadcastType } from "../types/broadcast";

export interface SendBroadcastDTO {
  userId: string;
  nickname: string;
  message: string;
  type: BroadcastType;
  itemId?: string;
}

export interface BroadcastResponseDTO {
  success: boolean;
  message: string;
  broadcastId?: string;
  expiresAt?: Date;
  error?: string;
  errorCode?: string;
}

export interface ReceiveBroadcastDTO {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  type: BroadcastType;
  sentAt: Date;
  expiresAt: Date;
  timeRemainingMs: number;
}

export interface BroadcastHistoryDTO {
  userId: string;
  broadcasts: Array<{
    id: string;
    message: string;
    type: BroadcastType;
    sentAt: Date;
  }>;
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BroadcastCooldownDTO {
  userId: string;
  canBroadcast: boolean;
  nextAvailableAt?: Date;
  cooldownMs?: number;
}

export interface ActiveBroadcastListDTO {
  broadcasts: Array<{
    id: string;
    userId: string;
    nickname: string;
    message: string;
    type: BroadcastType;
    sentAt: Date;
    expiresAt: Date;
    timeRemainingMs: number;
  }>;
  totalCount: number;
}
