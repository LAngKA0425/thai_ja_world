"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-skeleton bg-gray-100 rounded-lg ${className}`} />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-5 rounded-md" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-2/3 h-4" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-12 h-4" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AdminCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-16 h-5" />
      </div>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-2/3 h-4" />
    </div>
  );
}

export default Skeleton;
