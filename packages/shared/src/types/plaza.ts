import type { AvatarInfo } from "./user";

export interface PlazaUser {
  userId: string;
  nickname: string;
  avatarInfo: AvatarInfo;
  position: {
    x: number;
    y: number;
  };
  joinedAt: Date;
}

export interface PlazaChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface PlazaMessage {
  type: "chat" | "system" | "notification";
  userId?: string;
  nickname?: string;
  message: string;
  timestamp: Date;
}

export interface SystemMessage {
  type: "user_joined" | "user_left" | "user_moved" | "system_notification";
  userId?: string;
  nickname?: string;
  message: string;
  timestamp: Date;
}

export interface PlazaState {
  users: PlazaUser[];
  messages: PlazaChatMessage[];
  totalUsers: number;
  maxUsers: number;
}
