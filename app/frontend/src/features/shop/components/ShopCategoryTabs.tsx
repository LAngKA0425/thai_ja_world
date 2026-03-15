"use client";

import { useRef, useState } from "react";
import type { ShopCategory } from "../types/shop.types";

interface ShopCategoryTabsProps {
  categories: ShopCategory[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export default function ShopCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: ShopCategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-gray-900 to-transparent px-2 py-2"
        >
          ◀
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? "bg-blue-600 text-white shadow-lg"
                : "glass-card text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">{category.emoji}</span>
            <span className="text-sm font-medium">{category.label}</span>
            {category.itemCount > 0 && (
              <span className="text-2xs bg-black/30 px-2 py-0.5 rounded-full ml-1">
                {category.itemCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-gray-900 to-transparent px-2 py-2"
        >
          ▶
        </button>
      )}
    </div>
  );
}
