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

export default function HomePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ items: Post[] }>("/posts?limit=50")
      .then((r) => setAllPosts(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tipPosts = allPosts.filter((p) => p.type === "tip");
  const marketPosts = allPosts.filter((p) => p.type === "market");
  const hotPosts = allPosts.slice(0, 10);
  const meetupPosts = allPosts.filter((p) => p.type === "meetup" || p.type === "job");

  const latestBriefing = tipPosts[0];

  return (
    <main className="max-w-lg mx-auto px-4 pt-0 pb-20 bg-warm-pattern min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 -mx-4 px-5 py-3">
        <div className="glass-card rounded-2xl px-4 py-3 border border-white/60 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 text-white text-lg font-black shadow-glow">태</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white text-lg font-black shadow-brand">자</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-gray-800 tracking-tight leading-tight">태국에, 살자.</span>
                <span className="text-2xs text-primary-600/70 font-medium tracking-wide">태국 한인 커뮤니티</span>
              </div>
            </div>
            <Link href="/admin" className="flex items-center gap-1 text-2xs text-gray-300 hover:text-gray-500 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50">
              관리
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mt-3 mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl shadow-hero">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-accent-500 to-primary-500" />
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/[0.08] rounded-full" />
          <div className="absolute top-20 -right-4 w-24 h-24 bg-primary-400/15 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-accent-300/10 rounded-full" />
          <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/[0.05] rounded-2xl rotate-12" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />

          <div className="relative z-10 p-6 pb-7">
            {/* Top badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <span className="text-sm">🇹🇭</span>
              <span className="text-2xs font-semibold text-white/90">태국 한인들의 커뮤니티</span>
            </div>

            <h1 className="text-[1.65rem] font-black text-white tracking-tight leading-tight mb-2">
              {ko.brand.hero_title}<span className="text-white">!</span>
            </h1>
            <p className="text-sm text-white/80 leading-relaxed max-w-[280px] mb-6">
              {ko.brand.hero_sub}
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

      {/* ── Quick Stats Bar ── */}
      <section className="mb-8 animate-slide-up">
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "📋", label: "브리핑", count: tipPosts.length, color: "from-amber-50 to-orange-50 border-amber-100/60" },
            { emoji: "🛒", label: "장터", count: marketPosts.length, color: "from-emerald-50 to-teal-50 border-emerald-100/60" },
            { emoji: "🔥", label: "핫글", count: hotPosts.length, color: "from-rose-50 to-pink-50 border-rose-100/60" },
            { emoji: "👥", label: "모임", count: meetupPosts.length, color: "from-violet-50 to-indigo-50 border-violet-100/60" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-3 text-center`}>
              <span className="text-lg block mb-0.5">{s.emoji}</span>
              <span className="text-lg font-black text-gray-800 block leading-none">{s.count}</span>
              <span className="text-2xs text-gray-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {loading && <FeedSkeleton />}

      {!loading && (
        <>
          {/* ── 1. 오늘의 브리핑 ── */}
          <section className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-gray-800 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl text-base shadow-sm">📋</span>
                {ko.sections.briefing}
              </h2>
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
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-yellow-50/30 rounded-2xl p-8 text-center border border-amber-100/30">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-100/20 rounded-full" />
                <span className="text-3xl mb-3 block animate-bounce-soft">📭</span>
                <p className="text-sm font-semibold text-gray-500 mb-1">{ko.sections.no_briefing}</p>
                <p className="text-2xs text-gray-400">첫 브리핑을 작성해보세요</p>
              </div>
            )}
          </section>

          {/* ── 2. 번개장터 ── */}
          <section className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-gray-800 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl text-base shadow-sm">🛒</span>
                {ko.sections.market}
              </h2>
              <Link href="/search?type=market" className="inline-flex items-center gap-1 text-xs text-primary-600 font-bold hover:text-primary-700 transition-colors bg-accent-50 px-3 py-1.5 rounded-full">
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
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 rounded-2xl p-8 text-center border border-emerald-100/30">
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-teal-100/20 rounded-full" />
                <span className="text-3xl mb-3 block animate-bounce-soft">🏪</span>
                <p className="text-sm font-semibold text-gray-500 mb-1">{ko.sections.no_market}</p>
                <p className="text-2xs text-gray-400">물건을 올려보세요</p>
              </div>
            )}
          </section>

          {/* ── 제보하기 배너 ── */}
          <section className="mb-8 animate-slide-up">
            <a
              href={process.env.NEXT_PUBLIC_OPEN_KAKAO_URL || "/report"}
              target={process.env.NEXT_PUBLIC_OPEN_KAKAO_URL ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border border-red-100/60 rounded-2xl p-4.5 hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-100/30 rounded-full" />
              <span className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl text-xl group-hover:scale-110 transition-transform shadow-sm">🚨</span>
              <div className="relative flex-1">
                <p className="text-sm font-bold text-red-600">{ko.report_btn.label}</p>
                <p className="text-2xs text-red-400/80 mt-0.5">{ko.report_btn.desc}</p>
              </div>
              <span className="relative text-red-300 text-xl group-hover:translate-x-1 transition-transform">›</span>
            </a>
          </section>

          {/* ── 3. 핫 게시글 ── */}
          <section className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-gray-800 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl text-base shadow-sm">🔥</span>
                {ko.sections.hot_posts}
              </h2>
              <Link href="/search" className="inline-flex items-center gap-1 text-xs text-primary-600 font-bold hover:text-primary-700 transition-colors bg-accent-50 px-3 py-1.5 rounded-full">
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
              <EmptyState icon="feed" title={ko.sections.no_posts} />
            )}
          </section>

          {/* ── 4. 모임·구인 ── */}
          {meetupPosts.length > 0 && (
            <section className="mb-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-extrabold text-gray-800 flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl text-base shadow-sm">👥</span>
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

          {/* ── 안심번호 카피 ── */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
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
