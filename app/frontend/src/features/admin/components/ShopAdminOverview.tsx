"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface ShopItem {
  id: string;
  name: string;
  purchases: number;
  revenue: number;
}

interface ShopStats {
  totalItems: number;
  purchasesToday: number;
  pointsSpentToday: number;
  popularItems: ShopItem[];
}

export function ShopAdminOverview() {
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/admin/shop/overview");
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
        <h2 className="mb-6 text-lg font-bold text-gray-900">상점 현황</h2>
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
        <h2 className="mb-6 text-lg font-bold text-gray-900">상점 현황</h2>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-gray-900">상점 현황</h2>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 p-4">
          <p className="text-xs text-gray-600">전체 상품</p>
          <p className="mt-2 text-2xl font-bold text-violet-900">
            {stats.totalItems}
          </p>
          <p className="text-xs text-gray-500">개</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-fuchsia-50 to-pink-50 p-4">
          <p className="text-xs text-gray-600">오늘 구매</p>
          <p className="mt-2 text-2xl font-bold text-fuchsia-900">
            {stats.purchasesToday}
          </p>
          <p className="text-xs text-gray-500">건</p>
        </div>

        <div className="col-span-2 rounded-lg bg-gradient-to-br from-lime-50 to-green-50 p-4">
          <p className="text-xs text-gray-600">오늘 포인트 지출</p>
          <p className="mt-2 text-2xl font-bold text-lime-900">
            {stats.pointsSpentToday.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">TP</p>
        </div>
      </div>

      {/* Popular Items */}
      <div className="mb-6 border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">인기 상품</h3>
        {stats.popularItems.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">데이터가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.popularItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {item.purchases}회 구매
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.revenue.toLocaleString()} TP
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue/Spending Chart */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">매출 추이</h3>
        <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">차트 데이터 로드 중...</p>
        </div>
      </div>
    </div>
  );
}
