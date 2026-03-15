"use client";

import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface PointBalanceCardProps {
  balance: number;
  loading?: boolean;
}

export default function PointBalanceCard({ balance, loading }: PointBalanceCardProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="w-20 h-4 mb-2" />
        <Skeleton className="w-32 h-7" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">내 포인트</p>
          <p className="text-xl font-bold text-gray-900">
            {balance.toLocaleString()}
            <span className="text-sm font-medium text-primary-500 ml-1">TP</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <span className="text-white text-base">T</span>
        </div>
      </div>
      <p className="text-2xs text-gray-400 mt-2">글 작성, 댓글, 출석 등으로 포인트를 모아보세요</p>
    </Card>
  );
}
