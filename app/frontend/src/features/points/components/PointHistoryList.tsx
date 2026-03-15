"use client";

import type { PointHistoryEntry } from "../types/points.types";

interface PointHistoryListProps {
  entries: PointHistoryEntry[];
}

export default function PointHistoryList({ entries }: PointHistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        포인트 내역이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-700">{entry.description}</p>
            <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString("ko-KR")}</p>
          </div>
          <span className={`text-sm font-bold ${entry.amount > 0 ? "text-blue-600" : "text-red-500"}`}>
            {entry.amount > 0 ? "+" : ""}{entry.amount} TP
          </span>
        </div>
      ))}
    </div>
  );
}
