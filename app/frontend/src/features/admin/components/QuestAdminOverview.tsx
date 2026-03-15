"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface Quest {
  id: string;
  title: string;
  completions: number;
  active: boolean;
}

interface QuestStats {
  totalQuestsActive: number;
  completionsToday: number;
  topQuestByCompletions: Quest | null;
  pointsAwardedToday: number;
  quests: Quest[];
}

export function QuestAdminOverview() {
  const [stats, setStats] = useState<QuestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/admin/quests/overview");
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
        <h2 className="mb-6 text-lg font-bold text-gray-900">퀘스트 현황</h2>
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
        <h2 className="mb-6 text-lg font-bold text-gray-900">퀘스트 현황</h2>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-gray-900">퀘스트 현황</h2>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <p className="text-xs text-gray-600">활성 퀘스트</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {stats.totalQuestsActive}
          </p>
          <p className="text-xs text-gray-500">개</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <p className="text-xs text-gray-600">오늘 완료</p>
          <p className="mt-2 text-2xl font-bold text-purple-900">
            {stats.completionsToday}
          </p>
          <p className="text-xs text-gray-500">건</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
          <p className="text-xs text-gray-600">지급 포인트</p>
          <p className="mt-2 text-2xl font-bold text-cyan-900">
            {stats.pointsAwardedToday.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">TP</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
          <p className="text-xs text-gray-600">인기 퀘스트</p>
          <p className="mt-2 text-lg font-bold text-yellow-900">
            {stats.topQuestByCompletions?.title || "없음"}
          </p>
          {stats.topQuestByCompletions && (
            <p className="text-xs text-gray-500">
              {stats.topQuestByCompletions.completions}회
            </p>
          )}
        </div>
      </div>

      {/* Quest Completion Rate Chart */}
      <div className="mb-6 border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">퀘스트 완료율</h3>
        <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">차트 데이터 로드 중...</p>
        </div>
      </div>

      {/* Active/Inactive Quest Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 font-semibold text-gray-900">퀘스트 상태</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stats.quests.length === 0 ? (
            <p className="text-sm text-gray-500">퀘스트가 없습니다</p>
          ) : (
            stats.quests.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {quest.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    완료: {quest.completions}회
                  </p>
                </div>
                <button
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                    quest.active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {quest.active ? "활성" : "비활성"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
