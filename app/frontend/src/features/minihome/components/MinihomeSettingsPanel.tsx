"use client";

import { useState } from "react";
import type { MinihomeSettings } from "../types/minihome.types";

interface MinihomeSettingsPanelProps {
  settings: MinihomeSettings;
  onSave: (settings: MinihomeSettings) => void;
}

export default function MinihomeSettingsPanel({
  settings,
  onSave,
}: MinihomeSettingsPanelProps) {
  const [local, setLocal] = useState<MinihomeSettings>(settings);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
      <h3 className="text-sm font-bold text-gray-700">미니홈피 설정</h3>

      <label className="flex items-center justify-between">
        <span className="text-sm text-gray-600">공개 설정</span>
        <input
          type="checkbox"
          checked={local.isPublic}
          onChange={(e) => setLocal({ ...local, isPublic: e.target.checked })}
          className="rounded"
        />
      </label>

      <label className="flex items-center justify-between">
        <span className="text-sm text-gray-600">방명록 허용</span>
        <input
          type="checkbox"
          checked={local.allowGuestbook}
          onChange={(e) => setLocal({ ...local, allowGuestbook: e.target.checked })}
          className="rounded"
        />
      </label>

      <label className="flex items-center justify-between">
        <span className="text-sm text-gray-600">사진첩 공개</span>
        <input
          type="checkbox"
          checked={local.allowAlbumPublic}
          onChange={(e) => setLocal({ ...local, allowAlbumPublic: e.target.checked })}
          className="rounded"
        />
      </label>

      <button
        onClick={() => onSave(local)}
        className="w-full py-2 text-sm font-medium text-white bg-blue-500 rounded-lg"
      >
        저장
      </button>
    </div>
  );
}
