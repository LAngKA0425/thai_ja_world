import { apiFetch } from "@/lib/api";

export interface PointBalanceResponse {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  lastUpdated: string;
}

export async function getMyPointBalance(): Promise<PointBalanceResponse> {
  return apiFetch<PointBalanceResponse>("/points/balance");
}
