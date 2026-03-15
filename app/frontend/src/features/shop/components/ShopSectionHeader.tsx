"use client";

interface ShopSectionHeaderProps {
  title: string;
  emoji?: string;
  subtitle?: string;
  itemCount?: number;
  onViewAll?: () => void;
}

export default function ShopSectionHeader({
  title,
  emoji,
  subtitle,
  itemCount,
  onViewAll,
}: ShopSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          {emoji && <span>{emoji}</span>}
          {title}
          {itemCount !== undefined && (
            <span className="text-2xs font-medium text-gray-400 ml-1">
              ({itemCount})
            </span>
          )}
        </h3>
        {subtitle && (
          <p className="text-2xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-2xs text-blue-500 hover:text-blue-600 font-medium"
        >
          전체보기 →
        </button>
      )}
    </div>
  );
}
