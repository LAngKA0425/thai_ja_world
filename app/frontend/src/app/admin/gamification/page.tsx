"use client";

import { PointsAdminOverview } from "@/features/admin/components/PointsAdminOverview";
import { QuestAdminOverview } from "@/features/admin/components/QuestAdminOverview";
import { ShopAdminOverview } from "@/features/admin/components/ShopAdminOverview";
import { MinihomeAdminOverview } from "@/features/admin/components/MinihomeAdminOverview";
import { AvatarShopAdminOverview } from "@/features/admin/components/AvatarShopAdminOverview";
import { BgmAdminOverview } from "@/features/admin/components/BgmAdminOverview";
import { AlbumsAdminOverview } from "@/features/admin/components/AlbumsAdminOverview";
import { AvatarAdminOverview } from "@/features/admin/components/AvatarAdminOverview";

export default function GamificationAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            게임화 · 포인트 관리
          </h1>
          <p className="mt-2 text-gray-600">
            포인트, 퀘스트, 상점 및 미니홈피 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* Points Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">포인트 현황</h2>
          <PointsAdminOverview />
        </div>

        {/* Quest Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">퀘스트 현황</h2>
          <QuestAdminOverview />
        </div>

        {/* Shop Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">상점 현황</h2>
          <ShopAdminOverview />
        </div>

        {/* Minihome Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            미니홈피 현황
          </h2>
          <MinihomeAdminOverview />
        </div>

        {/* Avatar & Skin Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            아바타 · 스킨 현황
          </h2>
          <AvatarShopAdminOverview />
        </div>

        {/* BGM Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">BGM 현황</h2>
          <BgmAdminOverview />
        </div>

        {/* Albums Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">사진첩 현황</h2>
          <AlbumsAdminOverview />
        </div>

        {/* Avatar Management Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">아바타 관리</h2>
          <AvatarAdminOverview />
        </div>
      </div>
    </div>
  );
}
