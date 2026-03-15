"use client";

import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface MassagePromoData {
  partnerShopCount: number;
  isOpen: boolean;
  openDate: string | null;
}

export function MassageReservationPromo() {
  const [data, setData] = useState<MassagePromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(
          "/api/reservations/massage-promo-info"
        );
        setData(response);
        setError(null);
      } catch (err) {
        setError("정보를 불러올 수 없습니다");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 shadow-card">
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-rose-200"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 shadow-card">
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 shadow-card">
      {/* Status Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💆</span>
        </div>
        {data.isOpen ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
            오픈
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            곧 오픈
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold text-gray-900">
        마사지 예약 서비스
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        편안한 마사지 서비스를 예약하세요
      </p>

      {/* Partner Shop Count */}
      <div className="mb-4 rounded-lg bg-white bg-opacity-70 p-4">
        <p className="text-xs text-gray-600">제휴 샵</p>
        <p className="mt-1 text-xl font-bold text-rose-900">
          {data.partnerShopCount}
        </p>
        <p className="text-xs text-gray-500">개</p>
      </div>

      {/* Benefits Badge */}
      <div className="mb-4 rounded-lg bg-amber-100 px-3 py-2 text-center">
        <p className="text-xs font-semibold text-amber-900">
          TP 포인트 할인 가능
        </p>
      </div>

      {/* CTA Button */}
      {data.isOpen ? (
        <Link
          href="/reservations/massage"
          className="block w-full rounded-lg bg-rose-600 py-3 text-center font-semibold text-white hover:bg-rose-700"
        >
          예약하기
        </Link>
      ) : (
        <div className="rounded-lg bg-gray-300 py-3 text-center font-semibold text-gray-600">
          {data.openDate
            ? `${new Date(data.openDate).toLocaleDateString("ko-KR")}에 오픈 예정`
            : "오픈 예정"}
        </div>
      )}
    </div>
  );
}
