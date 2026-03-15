// TODO: 백엔드 API 연동 시 실제 스키마에 맞춰 확장
export interface ReservationShop {
  id: string;
  name: string;
  category: "massage" | "restaurant" | "salon" | "tour" | "other";
  address: string;
  area: string;
  rating: number;
  imageUrl?: string;
  isPartner: boolean;
}

export interface ReservationSlot {
  id: string;
  shopId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price: number;
  currency: "THB" | "KRW";
}

export interface Reservation {
  id: string;
  userId: string;
  shopId: string;
  slotId: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatusType = Reservation["status"];
