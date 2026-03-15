"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface ShopItemCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  durationDays?: number;
  purchasing?: boolean;
  onPurchase?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  nickname_color: "닉네임 색상",
  badge: "뱃지",
  minihome_skin: "미니홈피 스킨",
  emoji: "이모지",
  miniroom_item: "미니룸 아이템",
  avatar_hair: "헤어",
  avatar_top: "상의",
  avatar_bottom: "하의",
  avatar_accessory: "악세서리",
  bgm: "BGM",
};

export default function ShopItemCard({
  id,
  name,
  description,
  category,
  price,
  imageUrl,
  isAvailable,
  durationDays,
  purchasing,
  onPurchase,
}: ShopItemCardProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {/* 미리보기 */}
        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-2xl">🎁</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              <p className="text-2xs text-gray-400 truncate mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge>{categoryLabels[category] || category}</Badge>
            {durationDays && (
              <span className="text-2xs text-gray-400">{durationDays}일</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-sm font-bold text-amber-600">
              {price.toLocaleString()}
              <span className="text-2xs font-medium ml-0.5">TP</span>
            </p>
            <Button
              size="sm"
              variant={isAvailable ? "primary" : "secondary"}
              disabled={!isAvailable}
              loading={purchasing}
              onClick={() => onPurchase?.(id)}
            >
              {isAvailable ? "구매" : "품절"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
