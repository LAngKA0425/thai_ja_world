"use client";

import { apiFetch } from "@/lib/api";
import type { GuestbookListResponse, GuestbookEntry } from "../types/guestbook.types";

export async function fetchGuestbookEntries(
  ownerId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<GuestbookListResponse> {
  return apiFetch<GuestbookListResponse>(
    `/guestbook/${ownerId}?page=${page}&page_size=${pageSize}`
  );
}

export async function writeGuestbookEntry(
  ownerId: string,
  content: string
): Promise<GuestbookEntry> {
  return apiFetch<GuestbookEntry>("/guestbook/write", {
    method: "POST",
    body: JSON.stringify({ minihomeOwnerId: ownerId, content }),
  });
}

export async function deleteGuestbookEntry(entryId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/guestbook/${entryId}`, {
    method: "DELETE",
  });
}
