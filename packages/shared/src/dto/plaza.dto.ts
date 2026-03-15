export interface JoinPlazaDTO {
  userId: string;
  nickname: string;
  avatarId: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface LeavePlazaDTO {
  userId: string;
  nickname: string;
}

export interface MovementDTO {
  userId: string;
  position: {
    x: number;
    y: number;
  };
  direction?: "up" | "down" | "left" | "right" | "none";
  velocity?: {
    vx: number;
    vy: number;
  };
}

export interface ChatMessageDTO {
  userId: string;
  nickname: string;
  message: string;
  timestamp: Date;
}

export interface PlazaStateDTO {
  users: Array<{
    userId: string;
    nickname: string;
    position: {
      x: number;
      y: number;
    };
  }>;
  messages: Array<{
    id: string;
    userId: string;
    nickname: string;
    message: string;
    timestamp: Date;
  }>;
  totalUsers: number;
  maxUsers: number;
}

export interface PlazaUserPositionDTO {
  userId: string;
  nickname: string;
  position: {
    x: number;
    y: number;
  };
  avatar: {
    id: string;
    imageUrl: string;
  };
}

export interface PlazaEventDTO {
  type: "user_joined" | "user_left" | "user_moved" | "chat_message";
  userId?: string;
  nickname?: string;
  message?: string;
  position?: {
    x: number;
    y: number;
  };
  timestamp: Date;
}
