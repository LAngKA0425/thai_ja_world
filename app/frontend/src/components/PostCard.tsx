"use client";
import Link from "next/link";
import Badge, { getPostTypeBadgeVariant } from "@/components/ui/Badge";
import { IconHeart, IconComment, IconMapPin } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/timeago";
import ko from "@/messages/ko.json";

interface Post {
  id: string;
  author_id: string;
  type: string;
  title: string;
  body: string;
  area: string | null;
  tags: string | null;
  images?: string[] | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const typeLabel = (ko.post.types as Record<string, string>)[post.type] || post.type;
  const hasImage = post.images && post.images.length > 0;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-4 group"
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getPostTypeBadgeVariant(post.type)}>{typeLabel}</Badge>
            {post.area && (
              <span className="flex items-center gap-0.5 text-2xs text-gray-400">
                <IconMapPin size={12} className="text-gray-300" />
                {post.area}
              </span>
            )}
            <span className="text-2xs text-gray-300 ml-auto">{timeAgo(post.created_at)}</span>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">{post.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{post.body}</p>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <span className="flex items-center gap-1 text-2xs text-gray-400 group-hover:text-rose-400 transition-colors">
              <IconHeart size={14} />
              {post.like_count}
            </span>
            <span className="flex items-center gap-1 text-2xs text-gray-400 group-hover:text-primary-400 transition-colors">
              <IconComment size={14} />
              {post.comment_count}
            </span>
          </div>
        </div>

        {hasImage && (
          <div className="flex-shrink-0 w-18 h-18 rounded-xl overflow-hidden bg-gray-50">
            <img
              src={post.images![0]}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
