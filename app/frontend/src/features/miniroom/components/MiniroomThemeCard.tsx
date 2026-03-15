"use client";

import type { MiniroomTheme } from "../types/miniroom.types";

interface MiniroomThemeCardProps {
  theme: MiniroomTheme;
  isActive: boolean;
  onSelect: () => void;
}

export default function MiniroomThemeCard({
  theme,
  isActive,
  onSelect,
}: MiniroomThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl p-3 border text-left w-full ${
        isActive ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-white"
      }`}
    >
      <div
        className="w-full aspect-video rounded-lg mb-2"
        style={{ backgroundColor: theme.backgroundColor }}
      />
      <p className="text-sm font-medium text-gray-700">{theme.name}</p>
    </button>
  );
}
