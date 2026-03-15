"use client";

import { POINT_UNIT } from "../constants/pointShop.constants";

interface PointBalanceBadgeProps {
  points?: number;
  size?: "sm" | "md";
}

// TODO: usePointBalance 훅 연결 후 실제 잔액 표시
export default function PointBalanceBadge({ points = 1250, size = "sm" }: PointBalanceBadgeProps) {
  const sizeClass = size === "sm"
    ? "px-2.5 py-1 text-2xs"
    : "px-3.5 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClass} font-bold rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 text-amber-600 shadow-sm`}
    >
      <span className="text-amber-400">🪙</span>
      {POINT_UNIT} {points.toLocaleString()}
    </span>
  );
}
