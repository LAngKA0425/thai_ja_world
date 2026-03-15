"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Badge, { getPostTypeBadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { IconBack, IconHeart, IconBookmark, IconFlag, IconComment, IconMapPin } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/timeago";
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
  like_count: number;
  comment_count: number;
  created_at: string;
}
interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Post>(`/posts/${id}`).then(setPost).catch(() => {});
    apiFetch<Comment[]>(`/posts/${id}/comments`).then(setComments).catch(() => {});
  }, [id]);

  const handleLike = async () => {
    try {
      await apiFetch(`/posts/${id}/like`, { method: "POST" });
      setPost((p) => (p ? { ...p, like_count: p.like_count + 1 } : p));
    } catch {}
  };

  const handleBookmark = async () => {
    try {
      await apiFetch(`/posts/${id}/bookmark`, { method: "POST" });
      toast("success", ko.post.bookmarked);
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      const c = await apiFetch<Comment>(`/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: commentBody }),
      });
      setComments([...comments, c]);
      setCommentBody("");
    } catch (err: any) {
      toast("error", err.message);
    }
    setSubmitting(false);
  };

  const handleReport = async () => {
    try {
      await apiFetch("/moderation/reports", {
        method: "POST",
        body: JSON.stringify({ target_type: "post", target_id: id, reason: reportReason }),
      });
      setShowReport(false);
      setReportReason("");
      toast("success", ko.report.success);
    } catch {}
  };

  if (!post) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <Skeleton className="w-16 h-5 mb-4" />
        <Skeleton className="w-20 h-5 mb-3" />
        <Skeleton className="w-full h-7 mb-2" />
        <Skeleton className="w-full h-20 mb-4" />
        <Skeleton className="w-40 h-8" />
        <BottomNav />
      </main>
    );
  }

  const typeLabel = (ko.post.types as Record<string, string>)[post.type] || post.type;

  return (
    <main className="max-w-lg mx-auto px-4 pt-4 pb-20">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700 transition-colors"
      >
        <IconBack size={18} />
        {ko.common.back}
      </button>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={getPostTypeBadgeVariant(post.type)}>{typeLabel}</Badge>
        {post.area && (
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <IconMapPin size={13} className="text-gray-300" />
            {post.area}
          </span>
        )}
        <span className="text-xs text-gray-300 ml-auto">{timeAgo(post.created_at)}</span>
      </div>

      {/* Content */}
      <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
        {post.body}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Button variant="secondary" size="sm" onClick={handleLike}>
          <IconHeart size={15} className="mr-1" />
          {post.like_count}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleBookmark}>
          <IconBookmark size={15} className="mr-1" />
          {ko.post.bookmark}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-gray-400"
          onClick={() => setShowReport(!showReport)}
        >
          <IconFlag size={15} />
        </Button>
      </div>

      {/* Report */}
      {showReport && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2 animate-fade-in">
          <Input
            placeholder={ko.report.reason}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <Button variant="danger" size="sm" onClick={handleReport}>
            {ko.report.submit}
          </Button>
        </div>
      )}

      {/* Comments */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          {ko.post.comments} ({comments.length})
        </h2>

        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-xl px-3.5 py-2.5 animate-fade-in">
              <p className="text-sm text-gray-700">{c.body}</p>
              <span className="text-2xs text-gray-300 mt-1 block">
                {timeAgo(c.created_at)}
              </span>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <form onSubmit={handleComment} className="mt-4 flex gap-2">
          <input
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder={ko.post.write_comment}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-colors"
            required
          />
          <Button type="submit" size="md" loading={submitting}>
            <IconComment size={16} />
          </Button>
        </form>
      </section>

      <BottomNav />
    </main>
  );
}
