"use client";

import { useRouter } from "next/navigation";

interface ProfileMinihomeEntryProps {
  userId: string;
}

export default function ProfileMinihomeEntry({ userId }: ProfileMinihomeEntryProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/minihome/${userId}`)}
      className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
    >
      <span className="text-xl">🏠</span>
      <div className="text-left">
        <p className="text-sm font-medium text-gray-700">내 미니홈피</p>
        <p className="text-xs text-gray-400">미니홈피 보러 가기</p>
      </div>
    </button>
  );
}
