"use client";

import type { ProfileBadge } from "../types/profile.types";

// TODO: 실제 뱃지 데이터 연결
const PLACEHOLDER_BADGES: ProfileBadge[] = [
  { id: "b1", name: "얼리버드", emoji: "🐣", description: "초기 가입자", rarity: "rare" },
  { id: "b2", name: "활동왕", emoji: "🔥", description: "게시글 50개 이상", rarity: "common" },
  { id: "b3", name: "인기스타", emoji: "⭐", description: "좋아요 100개 달성", rarity: "epic" },
];

interface ProfileBadgeRowProps {
  badges?: ProfileBadge[];
}

export default function ProfileBadgeRow({ badges = PLACEHOLDER_BADGES }: ProfileBadgeRowProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      {badges.map((badge) => (
        <span
          key={badge.id}
          title={badge.description}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-100/80 shadow-sm text-2xs font-semibold text-gray-600 whitespace-nowrap hover:shadow-card transition-shadow cursor-default"
        >
          <span>{badge.emoji}</span>
          {badge.name}
        </span>
      ))}
    </div>
  );
}
