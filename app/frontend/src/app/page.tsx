"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";
import HomeExpansionPreview from "@/features/home/components/HomeExpansionPreview";
import NotificationBadge from "@/features/notifications/components/NotificationBadge";
import NotificationPreviewShell from "@/features/notifications/components/NotificationPreviewShell";
import HeroMotionLayer from "@/features/home/components/HeroMotionLayer";

interface Post {
  id: string;
  author_id: string;
  type: string;
  title: string;
  body: string;
  area: string | null;
  tags: string | null;
  images: string[] | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

/* ── Fallback data for when API is empty ── */
const FALLBACK_COMMUNITY_TALK = [
  { text: "방콕 아속 근처 새로 생긴 국밥집 후기 있음 🍜", time: "3분 전" },
  { text: "파타야 장기렌트 괜찮은 업체 아시는 분?", time: "12분 전" },
  { text: "실롬 마사지 괜찮은 곳 공유 부탁드려요 🙏", time: "28분 전" },
  { text: "구인구직 게시판 오늘 업데이트됐어요", time: "45분 전" },
  { text: "치앙마이 비자런 같이 갈 분 구합니다!", time: "1시간 전" },
  { text: "수쿰빗 한국 마트 세일 정보 공유합니다", time: "1시간 전" },
];

const FALLBACK_BRIEFING = {
  title: "운영자 브리핑이 곧 시작됩니다",
  desc: "태국 한인 핫이슈, 공지, 긴급정보가 이곳에 올라옵니다. 매일 아침 업데이트 예정!",
};

const FALLBACK_MARKET_ITEMS = [
  { title: "에어컨 리모컨 (새것)", price: "200฿", area: "방콕 아속", status: "판매중" },
  { title: "한국 라면 박스 (20개입)", price: "350฿", area: "파타야", status: "판매중" },
  { title: "자전거 팝니다", price: "3,000฿", area: "치앙마이", status: "예약중" },
  { title: "노트북 거치대 + 키보드", price: "800฿", area: "방콕 실롬", status: "판매중" },
];

const FALLBACK_HOT_POSTS = [
  { title: "태국 생활 1년차가 알려주는 꿀팁 모음", type: "팁·뉴스", comments: 24, likes: 58, time: "2시간 전" },
  { title: "방콕 한인 맛집 TOP 10 (2026 업데이트)", type: "후기", comments: 31, likes: 92, time: "5시간 전" },
  { title: "비자 연장 절차 변경 안내 (3월부터)", type: "팁·뉴스", comments: 15, likes: 43, time: "어제" },
];

const QUICK_CATEGORIES = [
  { emoji: "💬", label: "자유게시판", href: "/search", color: "from-sky-50 to-blue-50/80 border-sky-200/40" },
  { emoji: "🛒", label: "번개장터", href: "/search?type=market", color: "from-emerald-50 to-green-50/80 border-emerald-200/40" },
  { emoji: "🍜", label: "맛집정보", href: "/search?type=review", color: "from-orange-50 to-amber-50/80 border-orange-200/40" },
  { emoji: "💆", label: "마사지정보", href: "/search?type=review", color: "from-pink-50 to-rose-50/80 border-pink-200/40" },
  { emoji: "💼", label: "구인구직", href: "/search?type=job", color: "from-violet-50 to-purple-50/80 border-violet-200/40" },
  { emoji: "👥", label: "모임·번개", href: "/search?type=meetup", color: "from-teal-50 to-cyan-50/80 border-teal-200/40" },
];

const BANNER_ITEMS = [
  { text: "🍽️ 이번 주 태국 한인 추천 맛집", sub: "방콕 · 파타야 · 치앙마이" },
  { text: "🎉 신규 지역 모임 오픈!", sub: "코사무이 한인 모임 시작" },
  { text: "📚 태국 생활 꿀팁 모음", sub: "비자, 은행, 병원, 교통 총정리" },
];

export default function HomePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    apiFetch<{ items: Post[] }>("/posts?limit=50")
      .then((r) => {
        const items = Array.isArray((r as any)?.items)
          ? (r as any).items
          : Array.isArray(r)
            ? r
            : [];
        setAllPosts(items as Post[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNER_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const tipPosts = allPosts.filter((p) => p.type === "tip");
  const marketPosts = allPosts.filter((p) => p.type === "market");
  const hotPosts = allPosts.slice(0, 10);
  const meetupPosts = allPosts.filter((p) => p.type === "meetup" || p.type === "job");

  const latestBriefing = tipPosts[0];
  const hasRealPosts = allPosts.length > 0;

  return (
    <main className="max-w-lg mx-auto px-4 pt-0 pb-24 bg-warm-pattern min-h-screen">

      {/* ══════════════════════════════════════════════
          1. HEADER — Brand Bar
      ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 -mx-4 px-3 pt-2 pb-1">
        <div className="glass-card rounded-2xl px-4 py-2.5 border border-white/60 shadow-float">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo pair */}
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 text-white text-xl font-black shadow-glow tracking-tight">태</span>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white text-xl font-black shadow-brand tracking-tight">자</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-black text-gray-900 tracking-tight leading-tight">태국에, 살자.</span>
                <span className="text-2xs text-primary-500 font-semibold tracking-wide">🇹🇭 태국 한인 생활 커뮤니티</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationBadge count={2} size="sm" />
              <Link href="/admin" className="text-2xs text-gray-300 hover:text-gray-400 transition-colors px-2 py-1 rounded-lg">
                ⚙️
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          2. HERO — 메인 히어로
      ══════════════════════════════════════════════ */}
      <section className="mt-2.5 mb-5 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl shadow-hero">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-accent-500 to-primary-500" />
          {/* Decorative */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/[0.08] rounded-full" />
          <div className="absolute top-16 -right-6 w-28 h-28 bg-primary-400/15 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-accent-300/10 rounded-full" />
          <div className="absolute bottom-6 right-8 w-20 h-20 bg-white/[0.04] rounded-2xl rotate-12" />
          <div className="absolute top-4 left-1/2 w-32 h-32 bg-community-300/8 rounded-full" />
          {/* Living motion layer */}
          <HeroMotionLayer />
          {/* Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />

          <div className="relative z-10 px-6 pt-5 pb-6">
            {/* Micro badges row */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                <span className="text-xs">🇹🇭</span>
                <span className="text-2xs font-bold text-white">태국 한인 커뮤니티</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-400/25 backdrop-blur-sm rounded-full px-2.5 py-1 border border-amber-300/15">
                <span className="text-xs">📋</span>
                <span className="text-2xs font-bold text-white">오늘의 브리핑</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-300/25 backdrop-blur-sm rounded-full px-2.5 py-1 border border-emerald-300/15">
                <span className="text-xs">⚡</span>
                <span className="text-2xs font-bold text-white">번개장터 실시간</span>
              </span>
            </div>

            <h1 className="text-[1.75rem] font-black text-white tracking-tight leading-[1.15] mb-2.5">
              태국에 살자<span className="text-white">!</span>
            </h1>
            <p className="text-[13px] text-white/90 leading-[1.75] mb-5">
              🔥 핫이슈 · 생활정보 · 맛집 · 마사지<br />
              장터 · <span style={{ whiteSpace: "nowrap" }}>구인구직</span> · 모임<br />
              <span className="text-white/55 text-xs mt-0.5 inline-block">태국 한인들의 모든 것, 한 곳에서.</span>
            </p>

            <div className="flex gap-2.5">
              <Link
                href="/write"
                className="inline-flex items-center gap-1.5 bg-white text-primary-600 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-all shadow-sm active:scale-95"
              >
                <span className="text-sm">✏️</span> 글쓰기
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_OPEN_KAKAO_URL || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all backdrop-blur-sm active:scale-95 border border-white/10"
              >
                <span className="text-sm">🚨</span> {ko.report_btn.label}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. COMMUNITY TALK — 한줄 게시판
      ══════════════════════════════════════════════ */}
      <section className="mb-6 animate-slide-up">
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-50 to-primary-50/60 border-b border-accent-200/30">
            <span className="text-sm">💬</span>
            <span className="text-xs font-bold text-primary-600">커뮤니티 톡</span>
            <span className="inline-flex items-center gap-1 text-2xs text-community-400 font-semibold ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-community-400 animate-pulse-soft" />실시간</span>
          </div>
          <div className="px-4 py-2.5 space-y-2 max-h-[150px] overflow-hidden">
            {FALLBACK_COMMUNITY_TALK.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 group">
                <span className="flex-shrink-0 w-1 h-1 rounded-full bg-primary-500" />
                <span className="text-[12px] text-gray-600 truncate flex-1 leading-snug">{item.text}</span>
                <span className="flex-shrink-0 text-2xs text-gray-300 tabular-nums">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          Quick Stats Bar
      ══════════════════════════════════════════════ */}
      <section className="mb-6 animate-slide-up">
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "📋", label: "브리핑", count: tipPosts.length || "–", color: "from-amber-50/90 to-orange-50/70 border-amber-200/40" },
            { emoji: "🛒", label: "장터", count: marketPosts.length || "–", color: "from-emerald-50/90 to-teal-50/70 border-emerald-200/40" },
            { emoji: "🔥", label: "핫글", count: hasRealPosts ? hotPosts.length : "–", color: "from-rose-50/90 to-pink-50/70 border-rose-200/40" },
            { emoji: "👥", label: "모임", count: meetupPosts.length || "–", color: "from-violet-50/90 to-indigo-50/70 border-violet-200/40" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-2.5 text-center`}>
              <span className="text-base block mb-0.5">{s.emoji}</span>
              <span className="text-base font-black text-gray-800 block leading-none">{s.count}</span>
              <span className="text-2xs text-gray-500 font-semibold mt-0.5 block">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {loading && <FeedSkeleton />}

      {!loading && (
        <>
          {/* ══════════════════════════════════════════════
              4. 오늘의 브리핑
          ══════════════════════════════════════════════ */}
          <section className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg text-sm">📋</span>
                {ko.sections.briefing}
              </h2>
              <Link href="/search?type=tip" className="inline-flex items-center gap-0.5 text-[11px] text-primary-600 font-bold hover:text-primary-700 transition-colors bg-primary-50/80 px-2.5 py-1 rounded-full">
                전체보기 <span className="text-sm">→</span>
              </Link>
            </div>
            {latestBriefing ? (
              <Link
                href={`/posts/${latestBriefing.id}`}
                className="block relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50 border border-amber-200/50 rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="tip">팁·뉴스</Badge>
                    <span className="text-2xs text-gray-400">
                      {new Date(latestBriefing.created_at).toLocaleDateString("ko")}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors">{latestBriefing.title}</h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{latestBriefing.body}</p>
                  <div className="mt-3 flex items-center gap-1 text-2xs text-accent-500 font-semibold group-hover:gap-2 transition-all">
                    자세히 보기 <span className="text-sm">→</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/70 to-yellow-50/50 rounded-2xl border border-amber-200/30">
                {/* Decorative */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100/20 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-100/20 rounded-full" />
                {/* Content */}
                <div className="relative p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-white/80 rounded-2xl text-xl shadow-sm border border-amber-100/50">📋</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-gray-800">{FALLBACK_BRIEFING.title}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-100/80 rounded-md text-2xs font-semibold text-amber-600">준비중</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{FALLBACK_BRIEFING.desc}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Link href="/write" className="inline-flex items-center gap-1 text-2xs text-accent-600 font-bold hover:text-accent-700 transition-colors">
                          ✏️ 첫 브리핑 작성하기
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════
              5. 번개장터
          ══════════════════════════════════════════════ */}
          <section className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-community-100 to-community-50 rounded-lg text-sm">🛒</span>
                {ko.sections.market}
              </h2>
              <Link href="/search?type=market" className="inline-flex items-center gap-0.5 text-[11px] text-primary-600 font-bold hover:text-primary-700 transition-colors bg-primary-50/80 px-2.5 py-1 rounded-full">
                {ko.sections.more} <span className="text-sm">→</span>
              </Link>
            </div>
            {marketPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {marketPosts.slice(0, 8).map((p) => (
                  <Link
                    key={p.id}
                    href={`/posts/${p.id}`}
                    className="bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    {p.images && p.images[0] ? (
                      <div className="w-full h-32 bg-gray-50 overflow-hidden">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                        <span className="text-4xl opacity-40 animate-float">🛍️</span>
                      </div>
                    )}
                    <div className="p-3.5">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{p.title}</h4>
                      <div className="flex items-center gap-1 mt-2">
                        {p.area && (
                          <span className="inline-flex items-center gap-0.5 text-2xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">📍 {p.area}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Fallback: 장터 카드 셸 */
              <div className="grid grid-cols-2 gap-3">
                {FALLBACK_MARKET_ITEMS.map((item, i) => (
                  <Link
                    key={i}
                    href="/write"
                    className="bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="w-full h-28 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-cyan-50/60 flex items-center justify-center relative">
                      <span className="text-3xl opacity-30">🛍️</span>
                      <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 bg-emerald-100/80 rounded-md text-2xs font-semibold text-emerald-600">{item.status}</span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-gray-700 line-clamp-1 group-hover:text-primary-600 transition-colors">{item.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-black text-accent-500">{item.price}</span>
                        <span className="inline-flex items-center gap-0.5 text-2xs text-gray-400">📍 {item.area}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════
              6. 생활정보 퀵 카테고리
          ══════════════════════════════════════════════ */}
          <section className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg text-sm">🏠</span>
                생활정보
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`bg-gradient-to-br ${cat.color} border rounded-2xl py-3.5 px-2 text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group flex flex-col items-center justify-center`}
                >
                  <span className="text-[22px] block mb-1 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                  <span className="text-[11px] font-bold text-gray-600 leading-tight">{cat.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              6.5. 로그인 사용자 전용 — 상점 / 미니홈피 퀵 카드
          ══════════════════════════════════════════════ */}
          {isLoggedIn && (
            <section className="mb-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-3 px-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-xs font-bold text-gray-500">내 서비스</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/shop"
                  className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50/60 border border-amber-200/40 rounded-2xl p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="absolute -top-3 -right-3 w-14 h-14 bg-amber-100/30 rounded-full" />
                  <div className="relative">
                    <span className="flex items-center justify-center w-10 h-10 bg-white/80 rounded-xl shadow-sm text-xl mb-2.5 border border-amber-100/50 group-hover:scale-110 transition-transform">🛍️</span>
                    <p className="text-[13px] font-bold text-gray-800">상점</p>
                    <p className="text-2xs text-gray-400 mt-0.5">포인트로 꾸미기 아이템</p>
                  </div>
                </Link>
                <Link
                  href="/minihome"
                  className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50/80 to-indigo-50/60 border border-violet-200/40 rounded-2xl p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="absolute -top-3 -right-3 w-14 h-14 bg-violet-100/30 rounded-full" />
                  <div className="relative">
                    <span className="flex items-center justify-center w-10 h-10 bg-white/80 rounded-xl shadow-sm text-xl mb-2.5 border border-violet-100/50 group-hover:scale-110 transition-transform">🏡</span>
                    <p className="text-[13px] font-bold text-gray-800">미니홈피</p>
                    <p className="text-2xs text-gray-400 mt-0.5">나만의 공간 꾸미기</p>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════
              7. 제보 카드 — 강화
          ══════════════════════════════════════════════ */}
          <section className="mb-6 animate-slide-up">
            <a
              href={process.env.NEXT_PUBLIC_OPEN_KAKAO_URL || "/report"}
              target={process.env.NEXT_PUBLIC_OPEN_KAKAO_URL ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block relative overflow-hidden bg-gradient-to-r from-coral-400 via-coral-500 to-rose-400 rounded-2xl p-5 hover:shadow-hero transition-all duration-300 group"
            >
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />
              <div className="relative flex items-center gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">🚨</span>
                <div className="flex-1">
                  <p className="text-[14px] font-extrabold text-white mb-0.5">{ko.report_btn.label}</p>
                  <p className="text-[11px] text-white/75 leading-relaxed">{ko.report_btn.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 bg-white/15 rounded-full text-2xs font-semibold text-white/90">🔥 핫이슈</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-white/15 rounded-full text-2xs font-semibold text-white/90">사기정보</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-white/15 rounded-full text-2xs font-semibold text-white/90">긴급제보</span>
                  </div>
                </div>
                <span className="relative text-white/60 text-2xl group-hover:translate-x-1 transition-transform">›</span>
              </div>
            </a>
          </section>

          {/* ══════════════════════════════════════════════
              8. 배너 슬롯
          ══════════════════════════════════════════════ */}
          <section className="mb-6 animate-slide-up">
            <div className="bg-gradient-to-r from-accent-50 via-primary-50/70 to-accent-50/50 rounded-2xl border border-accent-200/30 p-4 overflow-hidden relative">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-200/20 rounded-full" />
              <div className="relative flex items-center gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-white/80 rounded-xl shadow-sm text-lg">{BANNER_ITEMS[bannerIndex].text.slice(0, 2)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{BANNER_ITEMS[bannerIndex].text.slice(2)}</p>
                  <p className="text-2xs text-gray-500 mt-0.5">{BANNER_ITEMS[bannerIndex].sub}</p>
                </div>
                <div className="flex gap-0.5">
                  {BANNER_ITEMS.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === bannerIndex ? "bg-primary-500" : "bg-accent-200"}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              8.5. 확장 서비스 미리보기 (포인트/미니홈피/예약)
          ══════════════════════════════════════════════ */}
          <HomeExpansionPreview />

          {/* ══════════════════════════════════════════════
              8.6. 새 소식 알림 미리보기
          ══════════════════════════════════════════════ */}
          <NotificationPreviewShell />

          {/* ══════════════════════════════════════════════
              9. 핫 게시글 / 자유게시판
          ══════════════════════════════════════════════ */}
          <section className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg text-sm">🔥</span>
                실시간 인기글
              </h2>
              <Link href="/search" className="inline-flex items-center gap-0.5 text-[11px] text-primary-600 font-bold hover:text-primary-700 transition-colors bg-primary-50/80 px-2.5 py-1 rounded-full">
                {ko.sections.more} <span className="text-sm">→</span>
              </Link>
            </div>
            {hotPosts.length > 0 ? (
              <div className="space-y-3">
                {hotPosts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            ) : (
              /* Fallback: 인기글 셸 */
              <div className="space-y-2.5">
                {FALLBACK_HOT_POSTS.map((item, i) => (
                  <Link
                    key={i}
                    href="/write"
                    className="block bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-4 group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 text-2xs font-bold rounded-md bg-accent-50 text-primary-600 border border-accent-200/50">{item.type}</span>
                      <span className="text-2xs text-gray-300 ml-auto tabular-nums">{item.time}</span>
                    </div>
                    <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors leading-snug">{item.title}</h3>
                    <div className="flex items-center gap-3.5 mt-2.5 pt-2 border-t border-gray-100/60">
                      <span className="flex items-center gap-1 text-2xs text-gray-400">❤️ {item.likes}</span>
                      <span className="flex items-center gap-1 text-2xs text-gray-400">💬 {item.comments}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── 모임·구인 (실 데이터 있을 때만) ── */}
          {meetupPosts.length > 0 && (
            <section className="mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-extrabold text-gray-800 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg text-sm">👥</span>
                  {ko.sections.meetup}
                </h2>
              </div>
              <div className="space-y-3">
                {meetupPosts.slice(0, 5).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════
              10. 안심번호 + 하단 여백
          ══════════════════════════════════════════════ */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 bg-gray-50/80 rounded-full px-4 py-2 border border-gray-100/40">
              <span className="text-sm">🔒</span>
              <p className="text-2xs text-gray-400 font-medium">{ko.post.contact_safe}</p>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}
