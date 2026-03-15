"use client";

import { useRouter } from "next/navigation";

interface ProfileMinihomeButtonProps {
  userId?: string;
  hasMinihome?: boolean;
}

export default function ProfileMinihomeButton({ userId, hasMinihome = false }: ProfileMinihomeButtonProps) {
  const router = useRouter();

  return (
    <button
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50/80 border border-sky-200/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
      onClick={() => {
        if (userId) {
          router.push(`/minihome/${userId}`);
        }
      }}
    >
      <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
        <span className="text-white text-sm">🏠</span>
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-gray-900">미니홈피 보기</p>
        <p className="text-2xs text-gray-400">
          {hasMinihome ? "내 미니홈피 방문하기" : "미니홈피를 만들어보세요"}
        </p>
      </div>
      <span className="text-gray-300 text-lg group-hover:translate-x-1 transition-transform">›</span>
    </button>
  );
}
