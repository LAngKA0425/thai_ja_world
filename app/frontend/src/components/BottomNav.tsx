"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ko from "@/messages/ko.json";
import { IconFeed, IconSearch, IconWrite, IconBookmark, IconProfile } from "@/components/ui/Icons";

const tabs = [
  { href: "/", label: ko.nav.feed, Icon: IconFeed },
  { href: "/search", label: ko.nav.search, Icon: IconSearch },
  { href: "/plaza", label: ko.nav.plaza, Icon: IconFeed },
  { href: "/write", label: ko.nav.write, Icon: IconWrite },
  { href: "/bookmarks", label: ko.nav.bookmarks, Icon: IconBookmark },
  { href: "/profile", label: ko.nav.profile, Icon: IconProfile },
];

/* ── Quick Action 항목 (로그인 시) ── */
const STATIC_QUICK_ACTIONS = [
  { href: "/write", label: "글쓰기", emoji: "✏️", color: "from-accent-400 to-primary-500" },
  { href: "/shop", label: "상점", emoji: "🛍️", color: "from-amber-400 to-orange-500" },
];

function useLoggedInUser() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) { setUserId(null); return; }
    // JWT payload에서 sub(userId) 추출
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.sub || null);
    } catch {
      setUserId(null);
    }
  }, []);
  return userId;
}

export default function BottomNav() {
  const pathname = usePathname();
  const userId = useLoggedInUser();
  const isLoggedIn = !!userId;
  const [showActions, setShowActions] = useState(false);

  const QUICK_ACTIONS = [
    ...STATIC_QUICK_ACTIONS,
    { href: userId ? `/minihome/${userId}` : "/profile", label: "미니홈피", emoji: "🏡", color: "from-violet-400 to-purple-500" },
  ];

  const handleWriteClick = useCallback((e: React.MouseEvent) => {
    if (isLoggedIn) {
      e.preventDefault();
      setShowActions((prev) => !prev);
    }
    // 비로그인: 기본 Link 동작 (글쓰기 → /write)
  }, [isLoggedIn]);

  const closeActions = useCallback(() => {
    setShowActions(false);
  }, []);

  // 라우트 변경 시 닫기
  useEffect(() => {
    setShowActions(false);
  }, [pathname]);

  return (
    <>
      {/* Quick Actions Overlay */}
      {showActions && (
        <div className="fixed inset-0 z-[60]" onClick={closeActions}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] quick-actions-backdrop" />
          {/* Action Sheet */}
          <div className="absolute bottom-[88px] left-0 right-0 flex justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <div className="quick-actions-sheet bg-white/95 backdrop-blur-xl rounded-2xl shadow-float border border-gray-200/50 p-3 w-full max-w-[280px]">
              <div className="flex items-center gap-1.5 px-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-2xs font-bold text-gray-500">바로가기</span>
              </div>
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={closeActions}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                  >
                    <span className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} text-white text-base shadow-sm group-active:scale-95 transition-transform`}>
                      {action.emoji}
                    </span>
                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-3 pb-2">
          <div className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-[1.25rem] shadow-float flex justify-around items-center h-[68px]">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={t.href === "/write" ? handleWriteClick : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 transition-all duration-200 rounded-xl ${
                    active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t.href === "/write" ? (
                    <span className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-accent-400 via-primary-400 to-primary-600 text-white -mt-7 shadow-hero active:scale-90 transition-transform border-[3.5px] border-white ${showActions ? "ring-2 ring-accent-300/50 scale-95" : ""}`}>
                      {showActions ? (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      ) : (
                        <t.Icon size={24} className="text-white" />
                      )}
                    </span>
                  ) : (
                    <>
                      <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-primary-50/80" : ""}`}>
                        <t.Icon size={22} className={`transition-colors duration-200 ${active ? "text-primary-600" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-2xs transition-all duration-200 ${active ? "font-bold text-primary-600" : "font-medium text-gray-400"}`}>
                        {t.label}
                      </span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-400 -mt-0.5 animate-pulse-soft" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
