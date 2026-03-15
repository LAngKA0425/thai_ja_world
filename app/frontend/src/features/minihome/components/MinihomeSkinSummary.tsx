"use client";

interface MinihomeSkinSummaryProps {
  skinId?: string;
  skinName?: string;
}

export default function MinihomeSkinSummary({ skinName }: MinihomeSkinSummaryProps) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-sm">🎨</span>
        <span className="text-sm text-gray-600">
          스킨: {skinName || "기본 스킨"}
        </span>
      </div>
    </div>
  );
}
