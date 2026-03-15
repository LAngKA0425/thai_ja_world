"use client";

interface OwnedItemsSummary {
  avatarItems: number;
  skins: number;
  bgms: number;
  totalItems: number;
}

interface ProfileOwnedItemsPreviewProps {
  summary?: OwnedItemsSummary;
  onViewShop?: () => void;
}

export default function ProfileOwnedItemsPreview({
  summary = { avatarItems: 0, skins: 0, bgms: 0, totalItems: 0 },
  onViewShop,
}: ProfileOwnedItemsPreviewProps) {
  const items = [
    { label: "아바타", count: summary.avatarItems, emoji: "👤", color: "text-blue-600 bg-blue-50" },
    { label: "스킨", count: summary.skins, emoji: "🎨", color: "text-pink-600 bg-pink-50" },
    { label: "BGM", count: summary.bgms, emoji: "🎵", color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <span>📦</span> 보유 아이템
          <span className="text-2xs text-gray-400 font-normal">
            ({summary.totalItems})
          </span>
        </h4>
        {onViewShop && (
          <button
            onClick={onViewShop}
            className="text-2xs text-blue-500 hover:text-blue-600 font-medium"
          >
            상점 →
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map(({ label, count, emoji, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50/80 border border-gray-100/50"
          >
            <span className="text-base">{emoji}</span>
            <span className={`text-lg font-bold ${color.split(" ")[0]}`}>
              {count}
            </span>
            <span className="text-2xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
