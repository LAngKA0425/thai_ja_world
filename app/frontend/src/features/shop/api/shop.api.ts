"use client";

import { apiFetch } from "@/lib/api";
import type { ShopItem, PurchaseResult } from "../types/shop.types";

export async function fetchShopItems(): Promise<ShopItem[]> {
  return apiFetch<ShopItem[]>("/shop/items");
}

export async function fetchShopItemsByCategory(
  category: ShopItem["category"]
): Promise<ShopItem[]> {
  return apiFetch<ShopItem[]>(`/shop/items/${category}`);
}

export async function purchaseItem(itemId: string): Promise<PurchaseResult> {
  return apiFetch<PurchaseResult>("/shop/purchase", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
}
