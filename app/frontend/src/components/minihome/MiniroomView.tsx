"use client";

import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface MiniroomItem {
  id: string;
  name: string;
  imageUrl: string;
  positionX: number;
  positionY: number;
  itemType: string;
}

interface MiniroomViewProps {
  items: MiniroomItem[];
  backgroundUrl?: string;
  loading?: boolean;
  isOwner?: boolean;
  onCustomize?: () => void;
}

export default function MiniroomView({
  items,
  backgroundUrl,
  loading,
  isOwner,
  onCustomize,
}: MiniroomViewProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="w-20 h-4 mb-3" />
        <Skeleton className="w-full h-40 rounded-xl" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">미니룸</p>
        {isOwner && onCustomize && (
          <button
            onClick={onCustomize}
            className="text-2xs text-primary-500 font-medium"
          >
            꾸미기
          </button>
        )}
      </div>

      <div
        className="relative w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-violet-50"
        style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-400">미니룸이 비어있어요</p>
              {isOwner && (
                <p className="text-2xs text-gray-300 mt-1">상점에서 아이템을 구매해 꾸며보세요</p>
              )}
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="absolute"
              style={{ left: `${item.positionX}%`, top: `${item.positionY}%` }}
              title={item.name}
            >
              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-contain" />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
