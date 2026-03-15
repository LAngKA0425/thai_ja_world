"use client";

interface MinihomeBgmSummaryProps {
  bgmItemId?: string;
  bgmName?: string;
}

export default function MinihomeBgmSummary({ bgmName }: MinihomeBgmSummaryProps) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-sm">🎵</span>
        <span className="text-sm text-gray-600">
          BGM: {bgmName || "없음"}
        </span>
      </div>
    </div>
  );
}
