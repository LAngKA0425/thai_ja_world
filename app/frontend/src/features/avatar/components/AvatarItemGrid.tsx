"use client";

import type { AvatarItem } from "../types/avatar.types";
import AvatarItemCard from "./AvatarItemCard";

interface AvatarItemGridProps {
  items: AvatarItem[];
  equippedItemIds: string[];
  onSelect: (item: AvatarItem) => void;
}

export default function AvatarItemGrid({
  items,
  equippedItemIds,
  onSelect,
}: AvatarItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        아이템이 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <AvatarItemCard
          key={item.id}
          item={item}
          isEquipped={equippedItemIds.includes(item.id)}
          onEquip={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
