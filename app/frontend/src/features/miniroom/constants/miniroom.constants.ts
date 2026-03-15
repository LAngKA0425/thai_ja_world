"use client";

import type { MiniroomObject } from "../types/miniroom.types";

export const MINIROOM_GRID = {
  width: 600,
  height: 400,
};

export const DEFAULT_OBJECTS: MiniroomObject[] = [
  {
    id: "bg_default",
    userId: "",
    itemType: "background",
    name: "기본 배경",
    imageUrl: "/assets/miniroom/background-default.png",
    positionX: 0,
    positionY: 0,
    isInteractable: false,
  },
];

export const TRASH_QUEST_COOLDOWN_MS = 60000;
