"use client";

import MiniroomThemeCard from "./MiniroomThemeCard";
import type { MiniroomTheme } from "../types/miniroom.types";

interface MiniroomCustomizerPanelProps {
  themes: MiniroomTheme[];
  activeThemeId?: string;
  onSelectTheme: (themeId: string) => void;
}

export default function MiniroomCustomizerPanel({
  themes,
  activeThemeId,
  onSelectTheme,
}: MiniroomCustomizerPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">미니룸 테마</h3>
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => (
          <MiniroomThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === activeThemeId}
            onSelect={() => onSelectTheme(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}
