export interface WriteGuestbookDTO {
  minihomeId: string;
  visitorId: string;
  message: string;
}

export interface GuestbookResponseDTO {
  success: boolean;
  message: string;
  entryId?: string;
  error?: string;
}

export interface GuestbookEntryDTO {
  id: string;
  visitorId: string;
  visitorNickname: string;
  message: string;
  createdAt: Date;
  canDelete?: boolean;
}

export interface GuestbookListDTO {
  minihomeId: string;
  ownerId: string;
  entries: GuestbookEntryDTO[];
  totalCount: number;
  canWrite: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeleteGuestbookEntryDTO {
  entryId: string;
  minihomeId: string;
  userId: string;
}

export interface DeleteGuestbookResponseDTO {
  success: boolean;
  message: string;
  error?: string;
}
