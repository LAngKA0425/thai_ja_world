"use client";

import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface PointTransaction {
  id: string;
  type: "earn" | "spend" | "refund";
  reason: string;
  amount: number;
  date: string;
}

export function PointHistoryPreview() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/points/history?limit=5");
        setTransactions(data.transactions || []);
        setError(null);
      } catch (err) {
        setError("내역을 불러올 수 없습니다");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "earn":
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
            <span className="text-sm text-green-600">↑</span>
          </div>
        );
      case "spend":
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
            <span className="text-sm text-red-600">↓</span>
          </div>
        );
      case "refund":
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm text-blue-600">⟲</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "어제";
    }

    return date.toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h3 className="mb-4 text-lg font-bold text-gray-900">포인트 내역</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h3 className="mb-4 text-lg font-bold text-gray-900">최근 포인트 내역</h3>

      {transactions.length === 0 ? (
        <p className="text-center text-sm text-gray-500">포인트 내역이 없습니다</p>
      ) : (
        <>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(tx.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {tx.reason}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "earn"
                      ? "text-green-600"
                      : tx.type === "spend"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {tx.type === "earn" ? "+" : "-"}
                  {tx.amount.toLocaleString()} TP
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/points/history"
            className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            전체 내역 보기
            <span className="ml-2">→</span>
          </Link>
        </>
      )}
    </div>
  );
}
