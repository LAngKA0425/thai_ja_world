"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconBack } from "@/components/ui/Icons";
import ShopItemCard from "@/components/shop/ShopItemCard";
import { getShopItems, purchaseShopItem } from "@/lib/shop";
import { getMyPointBalance } from "@/lib/points";
import { useToast } from "@/components/ui/Toast";
import type { ShopItem } from "@/features/shop/types/shop.types";

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "avatar", label: "아바타" },
  { id: "minihome_skin", label: "스킨" },
  { id: "bgm", label: "BGM" },
  { id: "miniroom_item", label: "미니룸" },
  { id: "badge", label: "뱃지" },
  { id: "nickname_color", label: "닉네임" },
  { id: "emoji", label: "이모지" },
];

export default function ShopPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getShopItems().catch(() => []),
      getMyPointBalance().catch(() => ({ availablePoints: 0 })),
    ])
      .then(([shopItems, pointData]) => {
        setItems(shopItems);
        setBalance(pointData.availablePoints);
      })
      .catch((err) => setError(err.message || "상점을 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const handlePurchase = async (itemId: string) => {
    setPurchasingId(itemId);
    try {
      const result = await purchaseShopItem(itemId);
      setBalance(result.remainingPoints);
      toast("success", "구매가 완료되었습니다!");
    } catch (err: any) {
      toast("error", err.message || "구매에 실패했습니다");
    } finally {
      setPurchasingId(null);
    }
  };

  if (error) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <IconBack size={16} /> 뒤로
        </button>
        <Card className="p-8 text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.back()}>
            돌아가기
          </Button>
        </Card>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 mb-4">
        <IconBack size={16} /> 뒤로
      </button>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">상점</h1>
        <div className="bg-amber-50 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-xs text-amber-600 font-medium">보유</span>
          <span className="text-sm font-bold text-amber-700">{balance.toLocaleString()} TP</span>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 상품 리스트 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-28 rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">해당 카테고리에 상품이 없어요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              category={item.category}
              price={item.price}
              imageUrl={item.imageUrl}
              isAvailable={item.isAvailable}
              durationDays={item.durationDays}
              purchasing={purchasingId === item.id}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
