"use client";

import { useEffect, useState } from "react";

interface QuestRewardBadgeProps {
  points: number;
  animated?: boolean;
}

export default function QuestRewardBadge({
  points,
  animated = false,
}: QuestRewardBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(animated);

  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
        isAnimating
          ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/50 scale-110"
          : "bg-gray-700 text-yellow-400"
      }`}
    >
      +{points} TP
    </div>
  );
}
