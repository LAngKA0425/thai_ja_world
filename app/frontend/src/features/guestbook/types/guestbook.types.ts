// Guestbook 타입 정의
export interface GuestbookEntry {
  id: string;
  minihomeOwnerId: string;
  authorId: string;
  authorNickname: string;
  content: string;
  isSecret: boolean;
  createdAt: string;
}

export interface GuestbookListResponse {
  entries: GuestbookEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GuestbookWriteRequest {
  minihomeOwnerId: string;
  content: string;
}

export interface GuestbookDeleteRequest {
  entryId: string;
}
