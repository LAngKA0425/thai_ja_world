"use client";

import ShopItemCard from "./ShopItemCard";
import type { ShopItem } from "../types/shop.types";

interface AvatarShopSectionProps {
  items: ShopItem[];
  onPurchase: (item: ShopItem) => void;
}

export default function AvatarShopSection({ items, onPurchase }: AvatarShopSectionProps) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        아바타 아이템이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-700 px-1">👤 아바타</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <ShopItemCard key={item.id} item={item} onPurchaseSuccess={() => onPurchase(item)} />
        ))}
      </div>
    </div>
  );
}
