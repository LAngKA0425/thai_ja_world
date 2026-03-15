import type { Socket } from "socket.io";

export interface SocketUser {
  userId: string;
  nickname: string;
  socketId: string;
  avatarId: string;
  connectedAt: Date;
}

export interface PlazaUserState {
  userId: string;
  nickname: string;
  avatarId: string;
  position: {
    x: number;
    y: number;
  };
  direction?: "up" | "down" | "left" | "right" | "none";
  velocity?: {
    vx: number;
    vy: number;
  };
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: Date;
}

export interface Broadcast {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  type: "NORMAL" | "PREMIUM";
  sentAt: Date;
  expiresAt: Date;
  timeoutId: NodeJS.Timeout;
}

export interface UserCooldown {
  userId: string;
  lastBroadcastTime: Date;
  cooldownMs: number;
}

export interface AuthPayload {
  sub?: string;
  type?: string;
  userId?: string;
  nickname?: string;
  avatarId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Auth middleware가 검증을 마친 뒤 socket.user에 저장하는 형태.
 * userId, nickname, avatarId가 반드시 존재한다.
 */
export interface ValidatedAuthPayload {
  userId: string;
  nickname: string;
  avatarId: string;
  sub?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export type AuthenticatedSocket = Socket & {
  user?: ValidatedAuthPayload;
};

/**
 * socket.user를 안전하게 꺼내는 헬퍼.
 * auth middleware를 통과한 소켓이면 항상 ValidatedAuthPayload를 반환한다.
 */
export function getSocketUser(socket: Socket): ValidatedAuthPayload {
  const user = (socket as any).user as ValidatedAuthPayload | undefined;
  if (!user || !user.userId) {
    throw new Error("Unauthenticated socket");
  }
  return user;
}
