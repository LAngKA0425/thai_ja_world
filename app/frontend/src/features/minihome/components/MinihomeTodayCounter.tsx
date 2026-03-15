"use client";

interface MinihomeTodayCounterProps {
  todayCount: number;
  totalCount: number;
}

export default function MinihomeTodayCounter({
  todayCount,
  totalCount,
}: MinihomeTodayCounterProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span>TODAY <strong className="text-blue-600">{todayCount}</strong></span>
      <span className="text-gray-300">|</span>
      <span>TOTAL <strong className="text-gray-700">{totalCount}</strong></span>
    </div>
  );
}
