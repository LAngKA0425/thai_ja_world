"use client";

import { apiFetch } from "@/lib/api";
import type { IlchonListResponse, IlchonRelation } from "../types/ilchon.types";

export interface IlchonRelationStatus {
  status: "none" | "self" | "pending" | "accepted" | "rejected";
  relationId: string | null;
  direction: "incoming" | "outgoing" | null;
}

export async function fetchIlchonList(userId: string): Promise<IlchonListResponse> {
  return apiFetch<IlchonListResponse>(`/ilchon/${userId}`);
}

export async function sendIlchonRequest(
  receiverId: string,
  ilchonComment?: string
): Promise<IlchonRelation> {
  return apiFetch<IlchonRelation>("/ilchon/request", {
    method: "POST",
    body: JSON.stringify({ receiverId, ilchonComment }),
  });
}

export async function acceptIlchonRequest(relationId: string): Promise<IlchonRelation> {
  return apiFetch<IlchonRelation>(`/ilchon/${relationId}/accept`, {
    method: "POST",
  });
}

export async function rejectIlchonRequest(relationId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/ilchon/${relationId}/reject`, {
    method: "POST",
  });
}

export async function removeIlchon(relationId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/ilchon/${relationId}`, {
    method: "DELETE",
  });
}

export async function fetchIlchonStatus(targetUserId: string): Promise<IlchonRelationStatus> {
  return apiFetch<IlchonRelationStatus>(`/ilchon/status/${targetUserId}`);
}
