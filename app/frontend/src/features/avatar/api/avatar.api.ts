"use client";

import { apiFetch } from "@/lib/api";
import type {
  AvatarItem,
  AvatarCategory,
  UserAvatarInventoryItem,
  EquippedAvatar,
  AvatarEquipResponse,
} from "../types/avatar.types";

export async function fetchAvatarItems(
  category?: AvatarCategory
): Promise<AvatarItem[]> {
  const query = category ? `?category=${category}` : "";
  return apiFetch<AvatarItem[]>(`/avatar/items${query}`);
}

export async function fetchMyAvatarInventory(): Promise<UserAvatarInventoryItem[]> {
  return apiFetch<UserAvatarInventoryItem[]>("/avatar/inventory");
}

export async function fetchEquippedAvatar(): Promise<EquippedAvatar> {
  return apiFetch<EquippedAvatar>("/avatar/equipped");
}

export async function equipAvatarItem(
  itemId: string,
  category: AvatarCategory
): Promise<AvatarEquipResponse> {
  return apiFetch<AvatarEquipResponse>("/avatar/equip", {
    method: "POST",
    body: JSON.stringify({ itemId, category }),
  });
}

export async function unequipAvatarItem(
  category: AvatarCategory
): Promise<AvatarEquipResponse> {
  return apiFetch<AvatarEquipResponse>("/avatar/unequip", {
    method: "POST",
    body: JSON.stringify({ category }),
  });
}
