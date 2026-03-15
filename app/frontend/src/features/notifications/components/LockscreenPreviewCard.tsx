"use client";

import { useState, useEffect } from "react";
import { LOCKSCREEN_COPY_SAMPLES } from "../constants/notificationTemplates.constants";

/**
 * 모바일 잠금화면 스타일 알림 프리뷰 카드
 * iOS/Android 느낌의 푸시 미리보기 — 브랜드 톤 검증용 UI
 * 실제 push 서버 연결 아님
 */
export default function LockscreenPreviewCard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOCKSCREEN_COPY_SAMPLES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const sample = LOCKSCREEN_COPY_SAMPLES[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 shadow-hero">
      {/* 잠금화면 배경 패턴 */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* 시간 표시 (잠금화면 느낌) */}
      <div className="text-center mb-4">
        <p className="text-[42px] font-extralight text-white/90 leading-none tracking-tight tabular-nums">
          {new Date().toLocaleTimeString("ko", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </p>
        <p className="text-xs text-white/40 mt-1 font-medium">
          {new Date().toLocaleDateString("ko", { month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      {/* 알림 카드 (iOS 스타일) */}
      <div className="bg-white/[0.12] backdrop-blur-md rounded-2xl p-3.5 border border-white/[0.08] transition-all duration-500">
        <div className="flex items-start gap-2.5">
          {/* 앱 아이콘 */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black">태</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">{sample.title}</span>
              <span className="text-[10px] text-white/30 tabular-nums">지금</span>
            </div>
            <p className="text-[13px] text-white/90 font-medium leading-snug">{sample.body}</p>
          </div>
        </div>
      </div>

      {/* 하단 인디케이터 */}
      <div className="flex justify-center gap-1 mt-3">
        {LOCKSCREEN_COPY_SAMPLES.slice(0, 4).map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex % 4 ? "bg-white/60 w-4" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* 라벨 */}
      <div className="mt-3 text-center">
        <span className="inline-flex items-center gap-1 text-2xs text-white/25 font-medium">
          🔔 알림 미리보기
        </span>
      </div>
    </div>
  );
}
