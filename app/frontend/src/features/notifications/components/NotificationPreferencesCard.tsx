"use client";

import { useNotificationPreferences } from "../hooks/useNotificationPreferences";

interface ToggleRowProps {
  emoji: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ emoji, label, desc, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-50/80 rounded-xl text-base border border-gray-100/60">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        <p className="text-2xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary-500" : "bg-gray-200"
        }`}
        aria-label={`${label} ${checked ? "켜짐" : "꺼짐"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationPreferencesCard() {
  const { prefs, togglePref } = useNotificationPreferences();

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-50/80 to-accent-50/60 border-b border-primary-100/30">
        <span className="text-sm">⚙️</span>
        <span className="text-xs font-bold text-primary-600">알림 설정</span>
      </div>

      {/* 토글 목록 */}
      <div className="px-4 divide-y divide-gray-100/60">
        <ToggleRow
          emoji="📢"
          label="핫이슈 알림"
          desc="커뮤니티 핫이슈, 생활정보 알림"
          checked={prefs.community}
          onChange={() => togglePref("community")}
        />
        <ToggleRow
          emoji="💬"
          label="댓글 · 소셜 알림"
          desc="댓글, 방명록, 미니홈피 방문 알림"
          checked={prefs.social}
          onChange={() => togglePref("social")}
        />
        <ToggleRow
          emoji="⚡"
          label="퀘스트 알림"
          desc="일일 퀘스트, 포인트 알림"
          checked={prefs.quest}
          onChange={() => togglePref("quest")}
        />
        <ToggleRow
          emoji="📅"
          label="예약 알림"
          desc="마사지 예약, 혜택 알림"
          checked={prefs.reservation}
          onChange={() => togglePref("reservation")}
        />

        <div className="pt-2 pb-1">
          <div className="flex items-center gap-2 px-1 py-2">
            <span className="text-2xs text-gray-300 font-semibold">푸시 알림</span>
          </div>
        </div>

        <ToggleRow
          emoji="🔔"
          label="모바일 푸시"
          desc="잠금화면에서 알림 받기"
          checked={prefs.pushEnabled}
          onChange={() => togglePref("pushEnabled")}
        />
      </div>

      {/* 안내 */}
      <div className="px-4 py-3 bg-gray-50/50">
        <p className="text-2xs text-gray-300 text-center">
          푸시 알림은 향후 업데이트에서 지원됩니다
        </p>
      </div>
    </div>
  );
}
