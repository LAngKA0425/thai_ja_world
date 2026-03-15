"use client";

import { useState } from "react";
import type { MiniroomObject } from "../types/miniroom.types";
import TrashQuestObject from "./TrashQuestObject";

interface MiniroomObjectLayerProps {
  objects: MiniroomObject[];
  onObjectInteract?: (object: MiniroomObject) => void;
}

export default function MiniroomObjectLayer({
  objects,
  onObjectInteract,
}: MiniroomObjectLayerProps) {
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  const handleObjectClick = (object: MiniroomObject) => {
    if (object.isInteractable) {
      onObjectInteract?.(object);
    }
  };

  return (
    <div className="absolute inset-0">
      {objects.map((obj) => {
        // Special handling for trash quest objects
        if (obj.itemType === "trash_quest") {
          return (
            <TrashQuestObject
              key={obj.id}
              object={obj}
              onInteract={() => handleObjectClick(obj)}
            />
          );
        }

        // Regular objects
        return (
          <div
            key={obj.id}
            style={{
              position: "absolute",
              left: `${obj.positionX}px`,
              top: `${obj.positionY}px`,
            }}
            className={`flex flex-col items-center ${
              obj.isInteractable ? "cursor-pointer group" : ""
            }`}
            onMouseEnter={() =>
              obj.isInteractable && setHoveredObjectId(obj.id)
            }
            onMouseLeave={() => setHoveredObjectId(null)}
            onClick={() => handleObjectClick(obj)}
          >
            <div
              className={`w-16 h-16 bg-cover bg-center rounded transition-transform duration-200 ${
                hoveredObjectId === obj.id ? "scale-110" : "scale-100"
              }`}
              style={{
                backgroundImage: `url(${obj.imageUrl})`,
              }}
            />
            {hoveredObjectId === obj.id && obj.isInteractable && (
              <div className="mt-1 text-2xs bg-black/70 px-2 py-1 rounded whitespace-nowrap text-white">
                클릭하기
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
