"use client";

import { useState } from "react";
import type { AvatarCategory, AvatarItem, UserAvatarInventoryItem, EquippedAvatar } from "../types/avatar.types";
import { SEED_AVATAR_ITEMS } from "../constants/avatarCategories.constants";
import AvatarPreview from "./AvatarPreview";
import AvatarCategoryTabs from "./AvatarCategoryTabs";
import AvatarItemCard from "./AvatarItemCard";

interface AvatarCustomizerPanelProps {
  equipped?: EquippedAvatar;
  inventory?: UserAvatarInventoryItem[];
  userPoints?: number;
  onEquip?: (itemId: string, category: AvatarCategory) => void;
  onPurchase?: (itemId: string) => void;
}

export default function AvatarCustomizerPanel({
  equipped,
  inventory = [],
  userPoints = 0,
  onEquip,
  onPurchase,
}: AvatarCustomizerPanelProps) {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>("hair");

  // 시드 데이터 사용 (추후 API 연결)
  const items: AvatarItem[] = SEED_AVATAR_ITEMS;
  const filteredItems = items.filter((item) => item.category === activeCategory);

  const categoryCounts: Record<AvatarCategory, number> = {
    hair: items.filter((i) => i.category === "hair").length,
    top: items.filter((i) => i.category === "top").length,
    bottom: items.filter((i) => i.category === "bottom").length,
    accessory: items.filter((i) => i.category === "accessory").length,
  };

  return (
    <div className="space-y-4">
      {/* 아바타 미리보기 */}
      <div className="flex justify-center py-4 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100">
        <AvatarPreview equipped={equipped} size="lg" />
      </div>

      {/* 카테고리 탭 */}
      <AvatarCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* 아이템 그리드 */}
      <div className="grid grid-cols-3 gap-2">
        {filteredItems.map((item) => {
          const invItem = inventory.find((inv) => inv.itemId === item.id);
          const isEquipped =
            equipped?.[activeCategory]?.itemId === item.id;

          return (
            <AvatarItemCard
              key={item.id}
              item={item}
              inventoryItem={invItem}
              isEquipped={isEquipped}
              onEquip={(id) => onEquip?.(id, activeCategory)}
              onPurchase={onPurchase}
              userPoints={userPoints}
            />
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400">
          이 카테고리에 아이템이 없습니다
        </div>
      )}
    </div>
  );
}
