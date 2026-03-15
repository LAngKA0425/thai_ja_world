export interface SendFriendRequestDTO {
  senderId: string;
  recipientId: string;
  message?: string;
}

export interface FriendResponseDTO {
  success: boolean;
  message: string;
  friendshipId?: string;
  error?: string;
}

export interface AcceptFriendRequestDTO {
  requestId: string;
  recipientId: string;
}

export interface RejectFriendRequestDTO {
  requestId: string;
  recipientId: string;
}

export interface CancelFriendRequestDTO {
  requestId: string;
  senderId: string;
}

export interface RemoveFriendDTO {
  userId: string;
  friendId: string;
}

export interface BlockUserDTO {
  userId: string;
  blockedUserId: string;
  reason?: string;
}

export interface UnblockUserDTO {
  userId: string;
  blockedUserId: string;
}

export interface FriendListDTO {
  userId: string;
  friends: Array<{
    userId: string;
    nickname: string;
    avatarId: string;
    status: string;
    isOnline: boolean;
    addedAt: Date;
  }>;
  totalCount: number;
}

export interface FriendRequestListDTO {
  userId: string;
  requests: Array<{
    requestId: string;
    senderId: string;
    senderNickname: string;
    message?: string;
    createdAt: Date;
  }>;
  totalCount: number;
}

export interface BlockListDTO {
  userId: string;
  blockedUsers: Array<{
    userId: string;
    nickname: string;
    reason?: string;
    blockedAt: Date;
  }>;
  totalCount: number;
}
