"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface MinihomeActivity {
  id: string;
  username: string;
  minihomeName: string;
  visitCount: number;
}

interface MinihomeStats {
  totalMinihomes: number;
  activeToday: number;
  totalGuestbookEntriestoday: number;
  totalVisitsToday: number;
  topVisitedMinihomes: MinihomeActivity[];
  recentGuestbookActivity: Array<{
    id: string;
    username: string;
    minihomeName: string;
    message: string;
    timestamp: string;
  }>;
}

export function MinihomeAdminOverview() {
  const [stats, setStats] = useState<MinihomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/admin/minihomes/overview");
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
        <h2 className="mb-6 text-lg font-bold text-gray-900">미니홈피 현황</h2>
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
        <h2 className="mb-6 text-lg font-bold text-gray-900">미니홈피 현황</h2>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-gray-900">미니홈피 현황</h2>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 p-4">
          <p className="text-xs text-gray-600">전체 미니홈피</p>
          <p className="mt-2 text-2xl font-bold text-rose-900">
            {stats.totalMinihomes}
          </p>
          <p className="text-xs text-gray-500">개</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
          <p className="text-xs text-gray-600">오늘 활동</p>
          <p className="mt-2 text-2xl font-bold text-teal-900">
            {stats.activeToday}
          </p>
          <p className="text-xs text-gray-500">개</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
          <p className="text-xs text-gray-600">방명록 항목</p>
          <p className="mt-2 text-2xl font-bold text-indigo-900">
            {stats.totalGuestbookEntriestoday}
          </p>
          <p className="text-xs text-gray-500">개</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
          <p className="text-xs text-gray-600">오늘 방문</p>
          <p className="mt-2 text-2xl font-bold text-orange-900">
            {stats.totalVisitsToday.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">건</p>
        </div>
      </div>

      {/* Top Visited Minihomes */}
      <div className="mb-6 border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">인기 미니홈피</h3>
        {stats.topVisitedMinihomes.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">데이터가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.topVisitedMinihomes.map((minihome, index) => (
              <div
                key={minihome.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {minihome.minihomeName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">@{minihome.username}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {minihome.visitCount}회
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Guestbook Activity */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">최근 방명록</h3>
        {stats.recentGuestbookActivity.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">데이터가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.recentGuestbookActivity.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.username} → {entry.minihomeName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
