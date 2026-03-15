"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";

interface NicknameColor {
  id: string;
  name: string;
  colorCode: string;
  price: number;
  owned: boolean;
  active: boolean;
}

const NICKNAME_COLOR_OPTIONS: NicknameColor[] = [
  {
    id: "default",
    name: "기본",
    colorCode: "#1F2937",
    price: 0,
    owned: true,
    active: false,
  },
  {
    id: "red",
    name: "빨강",
    colorCode: "#DC2626",
    price: 500,
    owned: false,
    active: false,
  },
  {
    id: "blue",
    name: "파랑",
    colorCode: "#2563EB",
    price: 500,
    owned: false,
    active: false,
  },
  {
    id: "purple",
    name: "보라",
    colorCode: "#9333EA",
    price: 500,
    owned: false,
    active: false,
  },
  {
    id: "green",
    name: "초록",
    colorCode: "#16A34A",
    price: 500,
    owned: false,
    active: false,
  },
  {
    id: "orange",
    name: "주황",
    colorCode: "#EA580C",
    price: 500,
    owned: false,
    active: false,
  },
  {
    id: "pink",
    name: "핑크",
    colorCode: "#EC4899",
    price: 500,
    owned: false,
    active: false,
  },
];

export function NicknameColorShopCard() {
  const [colors, setColors] = useState<NicknameColor[]>(NICKNAME_COLOR_OPTIONS);
  const [selectedColorId, setSelectedColorId] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedColor = colors.find((c) => c.id === selectedColorId);
  const nickname = "닉네임";

  const handlePurchase = async (colorId: string) => {
    try {
      setLoading(true);
      await apiFetch("/api/points/shop/nickname-color", {
        method: "POST",
        body: JSON.stringify({ colorId }),
      });

      setColors((prevColors) =>
        prevColors.map((c) =>
          c.id === colorId ? { ...c, owned: true } : c
        )
      );
      setError(null);
    } catch (err) {
      setError("구매에 실패했습니다");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h3 className="mb-6 text-lg font-bold text-gray-900">
        닉네임 색상 변경
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Preview Section */}
      <div className="mb-6 rounded-lg bg-gray-50 p-6 text-center">
        <p className="mb-2 text-xs text-gray-600">미리보기</p>
        <p
          className="text-2xl font-bold"
          style={{
            color: selectedColor?.colorCode || "#1F2937",
          }}
        >
          {nickname}
        </p>
      </div>

      {/* Color Selection */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-gray-900">색상 선택</p>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColorId(color.id)}
              className={`group relative flex flex-col items-center rounded-lg p-3 transition-all ${
                selectedColorId === color.id
                  ? "ring-2 ring-offset-2 ring-blue-500"
                  : "hover:bg-gray-100"
              }`}
            >
              <div
                className="mb-2 h-8 w-8 rounded-full shadow-sm"
                style={{ backgroundColor: color.colorCode }}
              ></div>
              <p className="text-xs font-medium text-gray-700">{color.name}</p>
              {!color.owned && color.price > 0 && (
                <p className="text-xs text-gray-500">{color.price} TP</p>
              )}
              {color.owned && (
                <p className="text-xs font-semibold text-green-600">소유</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      {selectedColor && selectedColor.price > 0 && !selectedColor.owned && (
        <div className="mb-6 rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-sm text-gray-600">가격</p>
          <p className="text-xl font-bold text-blue-900">
            {selectedColor.price.toLocaleString()} TP
          </p>
        </div>
      )}

      {/* Purchase Button */}
      {selectedColor && !selectedColor.owned && (
        <button
          onClick={() => handlePurchase(selectedColor.id)}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "구매 중..." : "구매하기"}
        </button>
      )}

      {selectedColor && selectedColor.owned && (
        <button
          disabled
          className="w-full rounded-lg bg-gray-200 py-3 text-center font-semibold text-gray-600"
        >
          이미 소유 중입니다
        </button>
      )}
    </div>
  );
}
