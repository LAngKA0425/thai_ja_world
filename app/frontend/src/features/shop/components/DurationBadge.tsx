"use client";

interface DurationBadgeProps {
  durationDays?: number;
  expiresAt?: string;
  isPermanent?: boolean;
}

export default function DurationBadge({
  durationDays,
  expiresAt,
  isPermanent = false,
}: DurationBadgeProps) {
  if (isPermanent) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-2xs font-medium">
        영구
      </span>
    );
  }

  if (expiresAt) {
    const now = new Date();
    const expDate = new Date(expiresAt);
    const daysLeft = Math.max(
      0,
      Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (daysLeft <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-600 text-2xs font-bold">
          만료됨
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold ${
          daysLeft <= 3
            ? "bg-red-100 text-red-600"
            : daysLeft <= 7
            ? "bg-orange-100 text-orange-600"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        {daysLeft}일 남음
      </span>
    );
  }

  if (durationDays) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-2xs font-medium">
        {durationDays}일 이용권
      </span>
    );
  }

  return null;
}
