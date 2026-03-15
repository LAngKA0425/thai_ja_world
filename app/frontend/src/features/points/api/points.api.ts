import { apiFetch } from "@/lib/api";
import type { PointBalance, PointTransaction, PointShopItem } from "../types/points.types";

const POINTS_BASE = "/points";

export async function fetchPointBalance(): Promise<PointBalance> {
  return apiFetch<PointBalance>(`${POINTS_BASE}/balance`);
}

export async function fetchPointHistory(page = 1, limit = 20): Promise<{ items: PointTransaction[]; total: number }> {
  return apiFetch<{ items: PointTransaction[]; total: number }>(`${POINTS_BASE}/history?skip=${(page - 1) * limit}&limit=${limit}`);
}

export async function fetchPointShopItems(): Promise<PointShopItem[]> {
  return apiFetch<PointShopItem[]>(`/shop/items`);
}

export async function purchaseShopItem(itemId: string): Promise<{ success: boolean; remainingPoints: number }> {
  return apiFetch<{ success: boolean; remainingPoints: number }>(`/shop/purchase`, {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
}

export async function fetchGemBalance(): Promise<{ gemBalance: number }> {
  return apiFetch<{ gemBalance: number }>(`${POINTS_BASE}/gems/balance`);
}

export async function fetchGemHistory(page = 1, limit = 20): Promise<{ items: PointTransaction[]; total: number }> {
  return apiFetch<{ items: PointTransaction[]; total: number }>(
    `${POINTS_BASE}/gems/history?skip=${(page - 1) * limit}&limit=${limit}`
  );
}
