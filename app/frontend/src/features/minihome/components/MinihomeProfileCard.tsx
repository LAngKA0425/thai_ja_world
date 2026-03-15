"use client";

interface MinihomeProfileCardProps {
  nickname: string;
  userId: string;
  avatarPreviewUrl?: string;
}

export default function MinihomeProfileCard({
  nickname,
  userId,
}: MinihomeProfileCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg">
        👤
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{nickname}</p>
        <p className="text-xs text-gray-400">@{userId.slice(0, 8)}</p>
      </div>
    </div>
  );
}
