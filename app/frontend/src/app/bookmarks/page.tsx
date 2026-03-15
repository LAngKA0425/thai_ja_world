"use client";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
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

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Post[]>("/posts/me/bookmarks")
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {ko.nav.bookmarks}
        </h1>
      </header>

      {loading && <FeedSkeleton />}

      {!loading && posts.length === 0 && (
        <EmptyState icon="bookmark" title={ko.post.no_bookmarks} />
      )}

      <div className="space-y-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
