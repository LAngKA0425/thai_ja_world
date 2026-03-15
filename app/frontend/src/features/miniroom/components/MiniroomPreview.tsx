"use client";

import { MINIROOM_GRID } from "../constants/miniroom.constants";
import type { MiniroomState } from "../types/miniroom.types";
import MiniroomObjectLayer from "./MiniroomObjectLayer";

interface MiniroomPreviewProps {
  miniroomState?: MiniroomState;
  isLoading?: boolean;
}

export default function MiniroomPreview({
  miniroomState,
  isLoading = false,
}: MiniroomPreviewProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-lg shadow-card overflow-hidden">
        <div
          style={{
            width: `${MINIROOM_GRID.width}px`,
            height: `${MINIROOM_GRID.height}px`,
          }}
          className="bg-gradient-to-b from-blue-200 to-blue-100 animate-pulse flex items-center justify-center"
        >
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg shadow-card overflow-hidden">
      <div
        style={{
          width: `${MINIROOM_GRID.width}px`,
          height: `${MINIROOM_GRID.height}px`,
        }}
        className="relative bg-gradient-to-b from-blue-200 to-blue-100"
      >
        {miniroomState && (
          <MiniroomObjectLayer objects={miniroomState.objects} />
        )}

        {miniroomState &&
          miniroomState.objects.some((obj) => obj.isInteractable) && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-2xs text-gray-200">
              💡 상호작용 가능한 아이템을 클릭해보세요!
            </div>
          )}
      </div>
    </div>
  );
}
