"use client";

import { useState } from "react";
import { MINIHOME_TABS } from "../constants/minihome.constants";
import type { MinihomeTab } from "../types/minihome.types";

// TODO: 각 탭 콘텐츠 컴포넌트 연결
interface MinihomeTabsProps {
  activeTab?: MinihomeTab;
  onTabChange?: (tab: MinihomeTab) => void;
}

export default function MinihomeTabs({ activeTab: controlledTab, onTabChange }: MinihomeTabsProps) {
  const [internalTab, setInternalTab] = useState<MinihomeTab>("home");
  const currentTab = controlledTab ?? internalTab;

  const handleTabChange = (tab: MinihomeTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <div className="flex gap-1 bg-white/80 rounded-xl border border-gray-100/80 p-1">
      {MINIHOME_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-2xs font-semibold transition-all ${
            currentTab === tab.id
              ? "bg-primary-500 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span className="text-xs">{tab.emoji}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
