import { apiFetch } from "@/lib/api";
import type { ReservationShop, ReservationSlot, Reservation } from "../types/reservations.types";

// TODO: 백엔드 엔드포인트 구현 후 연결
const RESERVATIONS_BASE = "/reservations";

export async function fetchPartnerShops(area?: string): Promise<ReservationShop[]> {
  const query = area ? `?area=${encodeURIComponent(area)}` : "";
  return apiFetch<ReservationShop[]>(`${RESERVATIONS_BASE}/shops${query}`);
}

export async function fetchAvailableSlots(shopId: string, date: string): Promise<ReservationSlot[]> {
  return apiFetch<ReservationSlot[]>(`${RESERVATIONS_BASE}/shops/${shopId}/slots?date=${date}`);
}

export async function createReservation(slotId: string, note?: string): Promise<Reservation> {
  return apiFetch<Reservation>(RESERVATIONS_BASE, {
    method: "POST",
    body: JSON.stringify({ slotId, note }),
  });
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>(`${RESERVATIONS_BASE}/my`);
}

export async function cancelReservation(reservationId: string): Promise<Reservation> {
  return apiFetch<Reservation>(`${RESERVATIONS_BASE}/${reservationId}/cancel`, { method: "POST" });
}
