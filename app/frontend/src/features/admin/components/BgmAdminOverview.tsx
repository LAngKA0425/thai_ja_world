"use client";

import { SEED_BGM_ITEMS, BGM_GENRES } from "@/features/minihome/constants/bgm.constants";

export function BgmAdminOverview() {
  // scaffold: 시드 데이터 기반 통계 (추후 API 연동)
  const bgms = SEED_BGM_ITEMS;
  const genres = BGM_GENRES.filter((g) => g.id !== "all");

  const genreCounts = genres.map((genre) => ({
    ...genre,
    count: bgms.filter((b) => b.genre === genre.id).length,
  }));

  const avgPrice = bgms.length > 0
    ? Math.round(bgms.reduce((sum, b) => sum + b.priceTp, 0) / bgms.length)
    : 0;

  const avgDuration = bgms.length > 0
    ? Math.round(bgms.reduce((sum, b) => sum + b.durationDays, 0) / bgms.length)
    : 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-gray-900">BGM 현황</h2>

      {/* 요약 통계 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 p-3 text-center">
          <p className="text-xs text-gray-500">총 BGM</p>
          <p className="text-xl font-bold text-indigo-900">{bgms.length}</p>
          <p className="text-2xs text-gray-400">곡</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 p-3 text-center">
          <p className="text-xs text-gray-500">평균 가격</p>
          <p className="text-xl font-bold text-yellow-900">{avgPrice}</p>
          <p className="text-2xs text-gray-400">TP</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-3 text-center">
          <p className="text-xs text-gray-500">평균 기간</p>
          <p className="text-xl font-bold text-blue-900">{avgDuration}</p>
          <p className="text-2xs text-gray-400">일</p>
        </div>
      </div>

      {/* 장르별 */}
      <div className="mb-6 border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">장르별 BGM</h3>
        <div className="space-y-2">
          {genreCounts.map(({ id, label, emoji, count }) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{emoji}</span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{count}곡</span>
            </div>
          ))}
        </div>
      </div>

      {/* 기간제 구조 확인 */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">운영 구조</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <span className="text-sm text-gray-600">기간제 사용권 구조</span>
            <span className="text-sm text-green-500 font-medium">✓ 적용됨</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <span className="text-sm text-gray-600">만료 → 비활성 처리</span>
            <span className="text-sm text-green-500 font-medium">✓ 설계됨</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <span className="text-sm text-gray-600">TP 결제 연동</span>
            <span className="text-sm text-blue-500 font-medium">scaffold</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <span className="text-sm text-gray-600">관리자 아이템 CRUD</span>
            <span className="text-sm text-blue-500 font-medium">확장 가능</span>
          </div>
        </div>
      </div>
    </div>
  );
}
