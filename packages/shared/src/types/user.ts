export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

export interface AvatarInfo {
  id: string;
  name: string;
  imageUrl: string;
}

export interface MinihomeProfile {
  id: string;
  userId: string;
  theme: string;
  backgroundItemId?: string;
  furnitureItems: string[];
}

export interface UserProfile {
  userId: string;
  bio?: string;
  minihome?: MinihomeProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  nicknameNormalized: string;
  nicknameChosung: string;
  avatarId: string;
  avatarInfo?: AvatarInfo;
  role: UserRole;
  status: UserStatus;
  gems: number;
  points: number;
  /** Style Points - user-facing name for gems (decoration-only currency) */
  stylePoints: number;
  /** Activity Score - non-spendable trust/reputation score */
  activityScore: number;
  locale: string;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfileCard {
  userId: string;
  nickname: string;
  avatarInfo: AvatarInfo;
  gems: number;
  points: number;
  /** Style Points - user-facing name for gems */
  stylePoints: number;
  /** Activity Score */
  activityScore: number;
  locale: string;
  minihomeTheme?: string;
}
