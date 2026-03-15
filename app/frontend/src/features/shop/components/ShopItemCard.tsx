"use client";

import { useState } from "react";
import type { ShopItem } from "../types/shop.types";
import { purchaseItem } from "../api/shop.api";
import PurchaseStatusBadge from "./PurchaseStatusBadge";

interface ShopItemCardProps {
  item: ShopItem;
  userPoints?: number;
  onPurchaseSuccess?: (item: ShopItem) => void;
}

export default function ShopItemCard({
  item,
  userPoints = 0,
  onPurchaseSuccess,
}: ShopItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canAfford = userPoints >= item.price;
  const isDisabled = isLoading || !item.isAvailable || !canAfford;

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await purchaseItem(item.id);
      if (result.success) {
        setShowConfirm(false);
        onPurchaseSuccess?.(result.purchasedItem);
      }
    } catch (error) {
      console.error("Failed to purchase item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-lg p-4 shadow-card hover:shadow-lg transition-shadow">
      <div className="mb-3 relative">
        {item.imageUrl ? (
          <div
            className="w-full h-32 bg-cover bg-center rounded-lg bg-gray-700"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
        ) : (
          <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center text-4xl">
            {item.category === "emoji" ? "😀" : "📦"}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <PurchaseStatusBadge
            isAvailable={item.isAvailable}
            isOwned={false}
          />
        </div>
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
        <p className="text-2xs text-gray-400 line-clamp-2">
          {item.description}
        </p>
      </div>

      {item.durationDays && (
        <div className="mb-2 inline-block bg-blue-600/30 px-2 py-1 rounded text-2xs text-blue-300">
          {item.durationDays}일
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-yellow-400">
          {item.price}
          <span className="text-sm text-gray-400"> TP</span>
        </span>
        {!canAfford && (
          <span className="text-2xs text-red-400">
            부족: {item.price - userPoints} TP
          </span>
        )}
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isDisabled}
          className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            isDisabled
              ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
          }`}
        >
          {isLoading ? "구매 중..." : "구매하기"}
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-2xs text-gray-300 text-center">
            정말 구매하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 px-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="flex-1 py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "중..." : "확인"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
