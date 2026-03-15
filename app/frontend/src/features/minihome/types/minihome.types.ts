// TODO: 백엔드 API 연동 시 실제 스키마에 맞춰 확장
export interface MinihomeProfile {
  userId: string;
  ownerNickname: string;
  title: string;
  description: string;
  skinId: string;
  bgmUrl?: string;
  todayVisitors: number;
  totalVisitors: number;
  createdAt: string;
}

export interface GuestbookEntry {
  id: string;
  authorId: string;
  authorNickname: string;
  content: string;
  isSecret: boolean;
  createdAt: string;
}

export interface MinihomeAlbumItem {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface MiniroomItem {
  id: string;
  itemType: "furniture" | "decoration" | "pet" | "background";
  name: string;
  imageUrl: string;
  positionX: number;
  positionY: number;
}

export interface MinihomeBgm {
  id: string;
  userId: string;
  title: string;
  artist?: string;
  url: string;
  isRepresentative: boolean;
  sortOrder: number;
  shopItemId?: string;
  createdAt: string;
}

export type MinihomeTab = "home" | "guestbook" | "album" | "miniroom" | "bgm";

export interface MinihomeSettings {
  isPublic: boolean;
  allowGuestbook: boolean;
  allowAlbumPublic: boolean;
  skinId?: string;
  bgmItemId?: string;
}
