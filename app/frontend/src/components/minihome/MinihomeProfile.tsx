"use client";

import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface MinihomeProfileProps {
  nickname: string;
  title: string;
  statusMessage?: string;
  avatarUrl?: string;
  todayVisitors: number;
  totalVisitors: number;
  ilchonCount: number;
  loading?: boolean;
}

export default function MinihomeProfile({
  nickname,
  title,
  statusMessage,
  avatarUrl,
  todayVisitors,
  totalVisitors,
  ilchonCount,
  loading,
}: MinihomeProfileProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-40 h-3" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={nickname} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span className="text-xl font-bold text-white">{nickname.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{nickname}</p>
          <p className="text-xs text-gray-400 truncate">{title}</p>
        </div>
      </div>

      {statusMessage && (
        <p className="text-xs text-gray-500 mb-3 px-1">{statusMessage}</p>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">Today</p>
          <p className="text-sm font-bold text-gray-900">{todayVisitors}</p>
        </div>
        <div className="w-px h-6 bg-gray-100" />
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-sm font-bold text-gray-900">{totalVisitors}</p>
        </div>
        <div className="w-px h-6 bg-gray-100" />
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">일촌</p>
          <p className="text-sm font-bold text-primary-600">{ilchonCount}</p>
        </div>
      </div>
    </Card>
  );
}
