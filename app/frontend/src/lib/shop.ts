import { apiFetch } from "@/lib/api";
import type { ShopItem, PurchaseResult } from "@/features/shop/types/shop.types";

export async function getShopItems(category?: string): Promise<ShopItem[]> {
  const path = category ? `/shop/items/${category}` : "/shop/items";
  return apiFetch<ShopItem[]>(path);
}

export async function purchaseShopItem(itemId: string): Promise<PurchaseResult> {
  return apiFetch<PurchaseResult>("/shop/purchase", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
}
