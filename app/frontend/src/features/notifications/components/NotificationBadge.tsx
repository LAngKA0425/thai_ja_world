"use client";

interface NotificationBadgeProps {
  count: number;
  /** sm: 헤더 아이콘용, lg: 프로필 영역용 */
  size?: "sm" | "lg";
  onClick?: () => void;
}

export default function NotificationBadge({
  count,
  size = "sm",
  onClick,
}: NotificationBadgeProps) {
  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center justify-center transition-all active:scale-95 ${
        isSmall
          ? "w-9 h-9 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100/60"
          : "w-11 h-11 rounded-2xl bg-primary-50/80 hover:bg-primary-100/80 border border-primary-100/50"
      }`}
      aria-label={`알림 ${count}건`}
    >
      <span className={isSmall ? "text-base" : "text-lg"}>🔔</span>
      {count > 0 && (
        <span
          className={`absolute flex items-center justify-center bg-gradient-to-br from-coral-400 to-rose-500 text-white font-black rounded-full shadow-sm border-2 border-white ${
            isSmall
              ? "-top-1 -right-1 min-w-[18px] h-[18px] text-[10px] px-1"
              : "-top-1.5 -right-1.5 min-w-[22px] h-[22px] text-[11px] px-1.5"
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
