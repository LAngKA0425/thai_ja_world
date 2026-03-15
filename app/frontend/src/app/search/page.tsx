"use client";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import EmptyState from "@/components/ui/EmptyState";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { IconSearch } from "@/components/ui/Icons";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface Post {
  id: string;
  type: string;
  title: string;
  body: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  area: string | null;
  tags: string | null;
  author_id: string;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await apiFetch<{ items: Post[] }>(`/posts?q=${encodeURIComponent(q)}`);
      setResults(r.items);
    } catch {}
    setSearched(true);
    setLoading(false);
  };

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
          {ko.nav.search}
        </h1>
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <IconSearch size={18} className="text-gray-400" />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ko.post.search_placeholder}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-colors"
          />
        </form>
      </header>

      {loading && <FeedSkeleton />}

      {!loading && searched && results.length === 0 && (
        <EmptyState icon="search" title={ko.post.no_search_results} />
      )}

      <div className="space-y-3">
        {results.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
