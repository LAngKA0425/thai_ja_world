"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface PointsStats {
  totalPointsInCirculation: number;
  pointsEarnedToday: number;
  pointsSpentToday: number;
  dailyCapViolations: number;
  suspiciousAccounts: Array<{
    id: string;
    username: string;
    reason: string;
  }>;
}

export function PointsAdminOverview() {
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/admin/points/overview");
        setStats(data);
        setError(null);
      } catch (err) {
        setError("통계를 불러올 수 없습니다");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-6 text-lg font-bold text-gray-900">포인트 현황</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-6 text-lg font-bold text-gray-900">포인트 현황</h2>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-gray-900">포인트 현황</h2>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
          <p className="text-xs text-gray-600">순환 중인 포인트</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">
            {stats.totalPointsInCirculation.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">TP</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4">
          <p className="text-xs text-gray-600">오늘 획득</p>
          <p className="mt-2 text-2xl font-bold text-green-900">
            {stats.pointsEarnedToday.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">TP</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <p className="text-xs text-gray-600">오늘 소비</p>
          <p className="mt-2 text-2xl font-bold text-red-900">
            {stats.pointsSpentToday.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">TP</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4">
          <p className="text-xs text-gray-600">한도 초과</p>
          <p className="mt-2 text-2xl font-bold text-red-900">
            {stats.dailyCapViolations}
          </p>
          <p className="text-xs text-gray-500">건</p>
        </div>
      </div>

      {/* Suspicious Accounts Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">의심 계정</h3>

        {stats.suspiciousAccounts.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">의심 계정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.suspiciousAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg bg-red-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {account.username}
                  </p>
                  <p className="text-xs text-gray-600">{account.reason}</p>
                </div>
                <button className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">
                  검토
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
