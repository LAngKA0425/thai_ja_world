"use client";

import { useState } from "react";
import MinihomeTabs from "./MinihomeTabs";
import type { MinihomeProfile, MinihomeTab } from "../types/minihome.types";

interface MinihomePageShellProps {
  profile: MinihomeProfile;
  children?: React.ReactNode;
}

export default function MinihomePageShell({ profile, children }: MinihomePageShellProps) {
  const [activeTab, setActiveTab] = useState<MinihomeTab>("home");

  return (
    <div className="max-w-lg mx-auto">
      <div className="mt-4">
        <MinihomeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
