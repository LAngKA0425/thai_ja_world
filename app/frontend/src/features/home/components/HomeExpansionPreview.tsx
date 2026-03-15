"use client";

import PointBalanceBadge from "@/features/points/components/PointBalanceBadge";
import MinihomePreviewCard from "@/features/minihome/components/MinihomePreviewCard";
import ReservationPromoBanner from "@/features/reservations/components/ReservationPromoBanner";
import LockscreenPreviewCard from "@/features/notifications/components/LockscreenPreviewCard";

// TODO: 각 기능 오픈 시 조건부 렌더링 적용 (feature flag)
// TODO: 사용자 로그인 상태에 따라 포인트/미니홈피 표시 여부 분기
export default function HomeExpansionPreview() {
  return (
    <section className="mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg text-sm">✨</span>
          새로운 서비스
        </h2>
        <span className="inline-flex items-center gap-1 text-2xs text-purple-400 font-semibold bg-purple-50/80 px-2.5 py-1 rounded-full">
          준비중
        </span>
      </div>
      <div className="space-y-3">
        {/* 포인트 잔액 미리보기 */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50/80 border border-amber-200/30">
          <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-white/80 rounded-xl shadow-sm text-lg border border-amber-100/50">🪙</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-700">태자 포인트</p>
            <p className="text-2xs text-gray-400">활동하면 포인트가 쌓여요</p>
          </div>
          <PointBalanceBadge points={0} size="sm" />
        </div>

        {/* 미니홈피 미리보기 */}
        <MinihomePreviewCard />

        {/* 예약 프로모 배너 */}
        <ReservationPromoBanner />

        {/* 알림 잠금화면 미리보기 */}
        <LockscreenPreviewCard />

        {/* 사진첩 · 방명록 · 일촌 미리보기 */}
        <div className="flex gap-2">
          <div className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50/80 border border-pink-200/30 text-center">
            <span className="text-lg">📷</span>
            <p className="text-2xs font-bold text-gray-600 mt-1">사진첩</p>
            <p className="text-2xs text-gray-400">준비중</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50/80 border border-green-200/30 text-center">
            <span className="text-lg">📝</span>
            <p className="text-2xs font-bold text-gray-600 mt-1">방명록</p>
            <p className="text-2xs text-gray-400">준비중</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200/30 text-center">
            <span className="text-lg">👥</span>
            <p className="text-2xs font-bold text-gray-600 mt-1">일촌</p>
            <p className="text-2xs text-gray-400">준비중</p>
          </div>
        </div>
      </div>
    </section>
  );
}
