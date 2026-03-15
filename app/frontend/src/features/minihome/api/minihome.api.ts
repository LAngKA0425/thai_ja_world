import { apiFetch } from "@/lib/api";
import type { MinihomeProfile, GuestbookEntry, MinihomeAlbumItem } from "../types/minihome.types";

const MINIHOME_BASE = "/minihome";

export interface MinihomeHandleResolution {
  handle: string;
  resolvedBy: "user_id" | "nickname";
  userId: string;
  nickname: string;
}

export async function resolveMinihomeHandle(handle: string): Promise<MinihomeHandleResolution> {
  const encoded = encodeURIComponent(handle);
  return apiFetch<MinihomeHandleResolution>(`${MINIHOME_BASE}/resolve/${encoded}`);
}

export async function fetchMinihomeProfile(userId: string): Promise<MinihomeProfile> {
  return apiFetch<MinihomeProfile>(`${MINIHOME_BASE}/${userId}`);
}

export async function fetchGuestbook(userId: string, page = 1): Promise<{ items: GuestbookEntry[]; total: number }> {
  const list = await apiFetch<GuestbookEntry[]>(`${MINIHOME_BASE}/${userId}/guestbook?offset=${(page - 1) * 10}&limit=10`);
  return { items: list, total: list.length };
}

export async function writeGuestbook(userId: string, content: string, isSecret = false): Promise<GuestbookEntry> {
  return apiFetch(`${MINIHOME_BASE}/${userId}/guestbook`, {
    method: "POST",
    body: JSON.stringify({ content, isSecret }),
  });
}

export async function fetchAlbum(userId: string): Promise<MinihomeAlbumItem[]> {
  return apiFetch<MinihomeAlbumItem[]>(`${MINIHOME_BASE}/${userId}/album`);
}
