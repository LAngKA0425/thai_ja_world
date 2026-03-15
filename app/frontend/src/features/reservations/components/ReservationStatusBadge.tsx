"use client";

import { RESERVATION_STATUS_MAP } from "../constants/reservations.constants";
import type { ReservationStatusType } from "../types/reservations.types";

interface ReservationStatusBadgeProps {
  status: ReservationStatusType;
}

export default function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const config = RESERVATION_STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold ${config.color} ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
}
