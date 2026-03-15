import { apiFetch } from "@/lib/api";
import type { MinihomeProfile, MinihomeBgm, MinihomeAlbumItem } from "@/features/minihome/types/minihome.types";
import type { GuestbookListResponse, GuestbookEntry } from "@/features/guestbook/types/guestbook.types";

export async function getMinihomeByUserId(userId: string): Promise<MinihomeProfile> {
  return apiFetch<MinihomeProfile>(`/minihome/${userId}`);
}

export async function getGuestbookEntries(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<GuestbookListResponse> {
  return apiFetch<GuestbookListResponse>(
    `/guestbook/${userId}?page=${page}&page_size=${pageSize}`
  );
}

export async function createGuestbookEntry(
  ownerId: string,
  content: string
): Promise<GuestbookEntry> {
  return apiFetch<GuestbookEntry>("/guestbook/write", {
    method: "POST",
    body: JSON.stringify({ minihomeOwnerId: ownerId, content }),
  });
}

export async function getMinihomeAlbums(userId: string): Promise<MinihomeAlbumItem[]> {
  return apiFetch<MinihomeAlbumItem[]>(`/minihome/${userId}/album`);
}

export async function getMinihomeBgm(userId: string): Promise<MinihomeBgm[]> {
  const res = await apiFetch<{ items: MinihomeBgm[]; total: number }>(`/minihome/${userId}/bgm`);
  return res.items;
}

export async function setRepresentativeBgm(userId: string, bgmId: string): Promise<MinihomeBgm> {
  return apiFetch<MinihomeBgm>(`/minihome/${userId}/bgm/representative`, {
    method: "PUT",
    body: JSON.stringify({ bgmId }),
  });
}

export async function getRepresentativeBgm(userId: string): Promise<MinihomeBgm | null> {
  return apiFetch<MinihomeBgm | null>(`/minihome/${userId}/bgm/representative`);
}
