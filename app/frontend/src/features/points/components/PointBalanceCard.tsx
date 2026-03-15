"use client";

import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

const POINT_UNIT = "TP";

interface PointBalance {
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
}

export function PointBalanceCard() {
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/points/balance");
        setBalance(data);
        setError(null);
      } catch (err) {
        setError("포인트 정보를 불러올 수 없습니다");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-card">
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-amber-200"></div>
          <div className="h-12 w-32 animate-pulse rounded bg-amber-200"></div>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-card">
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">포인트</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
          {POINT_UNIT}
        </span>
      </div>

      <div className="mb-8 space-y-4">
        {/* Total Points */}
        <div className="rounded-lg bg-white bg-opacity-60 p-4">
          <p className="text-xs text-gray-600">보유 포인트</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">
            {balance.totalPoints.toLocaleString()}
            <span className="ml-2 text-sm font-normal text-gray-600">
              {POINT_UNIT}
            </span>
          </p>
        </div>

        {/* Available and Pending Points */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white bg-opacity-60 p-3">
            <p className="text-xs text-gray-600">사용 가능</p>
            <p className="mt-1 text-lg font-bold text-amber-900">
              {balance.availablePoints.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white bg-opacity-60 p-3">
            <p className="text-xs text-gray-600">대기 중</p>
            <p className="mt-1 text-lg font-bold text-amber-900">
              {balance.pendingPoints.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Link to history */}
      <Link
        href="/points/history"
        className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-900"
      >
        포인트 내역 보기
        <span className="ml-2">→</span>
      </Link>
    </div>
  );
}
