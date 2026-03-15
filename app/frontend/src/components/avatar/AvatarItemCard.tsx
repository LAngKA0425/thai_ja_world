"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface AvatarItemCardProps {
  id: string;
  name: string;
  category: string;
  previewColor: string;
  previewImage?: string;
  isEquipped: boolean;
  owned: boolean;
  equipping?: boolean;
  onEquip?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  hair: "헤어",
  top: "상의",
  bottom: "하의",
  accessory: "악세서리",
};

export default function AvatarItemCard({
  id,
  name,
  category,
  previewColor,
  previewImage,
  isEquipped,
  owned,
  equipping,
  onEquip,
}: AvatarItemCardProps) {
  return (
    <Card className={`p-3 ${isEquipped ? "ring-2 ring-primary-300 border-primary-200" : ""}`}>
      {/* 프리뷰 */}
      <div
        className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: previewColor || "#f3f4f6" }}
      >
        {previewImage ? (
          <img src={previewImage} alt={name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </div>

      <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>

      <div className="flex items-center gap-1.5 mt-1 mb-2">
        <Badge>{categoryLabels[category] || category}</Badge>
        {isEquipped && <Badge variant="success">장착중</Badge>}
      </div>

      {owned && (
        <Button
          size="sm"
          variant={isEquipped ? "secondary" : "primary"}
          className="w-full"
          loading={equipping}
          onClick={() => onEquip?.(id)}
          disabled={isEquipped}
        >
          {isEquipped ? "장착중" : "장착하기"}
        </Button>
      )}
    </Card>
  );
}
