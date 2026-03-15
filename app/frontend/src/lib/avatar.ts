import { apiFetch } from "@/lib/api";
import type {
  AvatarCategory,
  UserAvatarInventoryItem,
  EquippedAvatar,
  AvatarEquipResponse,
} from "@/features/avatar/types/avatar.types";

export async function getMyAvatarItems(): Promise<UserAvatarInventoryItem[]> {
  return apiFetch<UserAvatarInventoryItem[]>("/avatar/inventory");
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

export async function getEquippedAvatar(): Promise<EquippedAvatar> {
  return apiFetch<EquippedAvatar>("/avatar/equipped");
}
