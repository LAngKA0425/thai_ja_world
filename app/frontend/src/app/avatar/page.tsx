"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconBack } from "@/components/ui/Icons";
import AvatarItemCard from "@/components/avatar/AvatarItemCard";
import { getMyAvatarItems, equipAvatarItem, getEquippedAvatar } from "@/lib/avatar";
import { useToast } from "@/components/ui/Toast";
import type { UserAvatarInventoryItem, EquippedAvatar, AvatarCategory } from "@/features/avatar/types/avatar.types";

const CATEGORY_TABS: { id: AvatarCategory | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "hair", label: "헤어" },
  { id: "top", label: "상의" },
  { id: "bottom", label: "하의" },
  { id: "accessory", label: "악세서리" },
];

export default function AvatarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<UserAvatarInventoryItem[]>([]);
  const [equipped, setEquipped] = useState<EquippedAvatar>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<AvatarCategory | "all">("all");
  const [equippingId, setEquippingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getMyAvatarItems().catch(() => []),
      getEquippedAvatar().catch(() => ({})),
    ])
      .then(([items, equippedData]) => {
        setInventory(items);
        setEquipped(equippedData as EquippedAvatar);
      })
      .catch((err) => setError(err.message || "아바타를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems =
    activeCategory === "all"
      ? inventory
      : inventory.filter((item) => item.item.category === activeCategory);

  const handleEquip = async (itemId: string) => {
    const inventoryItem = inventory.find((i) => i.itemId === itemId);
    if (!inventoryItem) return;

    setEquippingId(itemId);
    try {
      const result = await equipAvatarItem(itemId, inventoryItem.item.category);
      setEquipped(result.equipped);
      toast("success", "아바타를 장착했습니다!");
    } catch (err: any) {
      toast("error", err.message || "장착에 실패했습니다");
    } finally {
      setEquippingId(null);
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

      <h1 className="text-xl font-bold text-gray-900 mb-4">아바타 꾸미기</h1>

      {/* 현재 장착 프리뷰 */}
      <Card className="p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">현재 장착중인 아바타</p>
        <div className="flex items-center gap-3">
          {(["hair", "top", "bottom", "accessory"] as AvatarCategory[]).map((cat) => {
            const equippedItem = equipped[cat];
            return (
              <div key={cat} className="flex-1 text-center">
                <div
                  className="w-full aspect-square rounded-xl mb-1 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: equippedItem?.item.previewColor || "#f3f4f6" }}
                >
                  {equippedItem?.item.previewImage ? (
                    <img src={equippedItem.item.previewImage} alt={equippedItem.item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </div>
                <p className="text-2xs text-gray-400">
                  {cat === "hair" ? "헤어" : cat === "top" ? "상의" : cat === "bottom" ? "하의" : "악세서리"}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === tab.id
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">보유한 아바타 아이템이 없어요</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => router.push("/shop")}>
            상점에서 구매하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <AvatarItemCard
              key={item.itemId}
              id={item.itemId}
              name={item.item.name}
              category={item.item.category}
              previewColor={item.item.previewColor}
              previewImage={item.item.previewImage}
              isEquipped={item.isEquipped}
              owned={true}
              equipping={equippingId === item.itemId}
              onEquip={handleEquip}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
