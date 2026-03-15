import type { AvatarInfo } from "./user";

export enum FriendStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  BLOCKED = "BLOCKED",
  REJECTED = "REJECTED",
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderNickname: string;
  recipientId: string;
  status: FriendStatus;
  message?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface FriendListItem {
  userId: string;
  nickname: string;
  avatarInfo: AvatarInfo;
  status: FriendStatus;
  addedAt: Date;
  lastInteractionAt?: Date;
  isOnline?: boolean;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  blockedAt?: Date;
  rejectedAt?: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface BlockRecord {
  id: string;
  userId: string;
  blockedUserId: string;
  reason?: string;
  createdAt: Date;
}
