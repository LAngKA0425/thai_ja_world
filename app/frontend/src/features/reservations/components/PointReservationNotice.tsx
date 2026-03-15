"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface ReservationNoticeData {
  userPoints: number;
  maxDiscountPercentage: number;
  estimatedDiscount: number;
}

export function PointReservationNotice() {
  const [data, setData] = useState<ReservationNoticeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(
          "/api/reservations/point-discount-info"
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
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-card">
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-blue-200"></div>
          <div className="h-8 w-24 animate-pulse rounded bg-blue-200"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-card">
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-card">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">포인트 할인</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
          최대 {data.maxDiscountPercentage}% 할인
        </span>
      </div>

      {/* Main Info */}
      <div className="mb-6 rounded-lg bg-white bg-opacity-70 p-4">
        <p className="text-xs text-gray-600">포인트로 예약 시</p>
        <p className="mt-2 text-2xl font-bold text-blue-900">
          최대 {data.maxDiscountPercentage}% 할인
        </p>
        <p className="mt-1 text-xs text-gray-600">
          예약 가격에서 할인을 받을 수 있습니다
        </p>
      </div>

      {/* User Points Display */}
      <div className="mb-6 rounded-lg bg-white bg-opacity-70 p-4">
        <p className="text-xs text-gray-600">보유 포인트</p>
        <p className="mt-2 text-xl font-bold text-cyan-900">
          {data.userPoints.toLocaleString()} TP
        </p>
      </div>

      {/* Estimated Discount */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 p-4">
        <p className="text-xs text-gray-600">예상 할인액</p>
        <p className="mt-2 text-lg font-bold text-blue-900">
          {data.estimatedDiscount.toLocaleString()} TP
        </p>
        <p className="text-xs text-gray-600">보유 포인트 기준</p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-yellow-50 p-4 text-xs text-gray-700">
        <p className="font-semibold text-gray-900 mb-1">안내</p>
        <p>
          포인트는 결제를 완전히 대체하지 않으며, 할인 보조 수단입니다. 예약
          가격과 포인트 할인액이 상이할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
