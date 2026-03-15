"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconFlag, IconEyeOff, IconShield, IconChart, IconProfile, IconSend } from "@/components/ui/Icons";
import { apiFetch } from "@/lib/api";
import ko from "@/messages/ko.json";

interface DashboardStats {
  todayScheduled: number;
  todayPublished: number;
  todayFailed: number;
  unreadNotifications: number;
  totalUsers: number;
  newUsers24h: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardStats>("/admin/dashboard")
      .then(setStats)
      .catch(() => {
        setStats({
          todayScheduled: 0,
          todayPublished: 0,
          todayFailed: 0,
          unreadNotifications: 0,
          totalUsers: 0,
          newUsers24h: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: ko.admin.today_scheduled, value: stats?.todayScheduled ?? 0, Icon: IconShield, color: "text-blue-500", bg: "bg-blue-50" },
    { label: ko.admin.today_published, value: stats?.todayPublished ?? 0, Icon: IconSend, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: ko.admin.today_failed, value: stats?.todayFailed ?? 0, Icon: IconFlag, color: "text-red-500", bg: "bg-red-50" },
    { label: ko.admin.unread_alerts, value: stats?.unreadNotifications ?? 0, Icon: IconFlag, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "전체 유저", value: stats?.totalUsers ?? 0, Icon: IconProfile, color: "text-violet-500", bg: "bg-violet-50" },
    { label: ko.admin.new_24h, value: stats?.newUsers24h ?? 0, Icon: IconChart, color: "text-primary-500", bg: "bg-primary-50" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">{ko.admin.dashboard}</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.Icon size={18} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* ── 싸이월드 관리 진입 ── */}
      <h3 className="text-sm font-bold text-gray-700 mt-6 mb-3">싸이월드 기능 관리</h3>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <span className="text-base">🏡</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">미니홈피</p>
          <p className="text-2xs text-gray-400 mt-0.5">미니홈피 설정 관리</p>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <span className="text-base">🛍️</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">상점</p>
          <p className="text-2xs text-gray-400 mt-0.5">상점 아이템 관리</p>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center mb-3">
            <span className="text-base">👤</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">아바타</p>
          <p className="text-2xs text-gray-400 mt-0.5">아바타 아이템 관리</p>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <span className="text-base">💰</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">포인트</p>
          <p className="text-2xs text-gray-400 mt-0.5">TP 포인트 관리</p>
        </Card>
      </div>
    </div>
  );
}
