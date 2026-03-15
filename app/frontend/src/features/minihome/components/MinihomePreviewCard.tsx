"use client";

// TODO: 실제 미니홈피 라우트 연결 (/minihome/[userId])
interface MinihomePreviewCardProps {
  userId?: string;
  nickname?: string;
  title?: string;
  todayVisitors?: number;
  totalVisitors?: number;
}

export default function MinihomePreviewCard({
  nickname = "닉네임",
  title = "나의 미니홈피",
  todayVisitors = 0,
  totalVisitors = 0,
}: MinihomePreviewCardProps) {
  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/30 rounded-2xl border border-sky-200/40 p-4 hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white/80 border border-sky-100/50 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <span className="text-xl">🏠</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{nickname}의 미니홈피</p>
          <p className="text-2xs text-gray-500 truncate">{title}</p>
        </div>
        <div className="text-right">
          <p className="text-2xs text-sky-500 font-semibold">TODAY {todayVisitors}</p>
          <p className="text-2xs text-gray-400">TOTAL {totalVisitors}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-2xs text-sky-500 font-semibold group-hover:gap-2 transition-all">
        미니홈피 방문하기 <span className="text-sm">→</span>
      </div>
    </div>
  );
}
