"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { MiniroomObject, TrashQuestResult } from "../types/miniroom.types";
import { TRASH_QUEST_COOLDOWN_MS } from "../constants/miniroom.constants";

interface TrashQuestObjectProps {
  object: MiniroomObject;
  onInteract?: () => void;
}

export default function TrashQuestObject({
  object,
  onInteract,
}: TrashQuestObjectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastCleanTime, setLastCleanTime] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<TrashQuestResult | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (!lastCleanTime) return;

    const remaining = TRASH_QUEST_COOLDOWN_MS - (Date.now() - lastCleanTime);
    if (remaining > 0) {
      setCooldownTime(Math.ceil(remaining / 1000));
      const timer = setInterval(() => {
        setCooldownTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastCleanTime]);

  const isOnCooldown = cooldownTime > 0;

  const handleClean = async () => {
    if (isLoading || isOnCooldown) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      const result = await apiFetch<TrashQuestResult>("/miniroom/trash-quest/complete", {
        method: "POST",
      });
      setShowResult(result);
      setLastCleanTime(Date.now());
      onInteract?.();

      setTimeout(() => {
        setIsAnimating(false);
        setShowResult(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to clean trash:", error);
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${object.positionX}px`,
        top: `${object.positionY}px`,
      }}
      className="flex flex-col items-center"
    >
      <button
        onClick={handleClean}
        disabled={isLoading || isOnCooldown}
        className={`relative w-20 h-20 flex items-center justify-center text-3xl rounded-lg transition-all duration-200 ${
          isAnimating ? "scale-95 opacity-50" : "scale-100"
        } ${
          isOnCooldown
            ? "cursor-not-allowed opacity-60"
            : "hover:scale-110 cursor-pointer bg-gray-700/40 hover:bg-gray-600/50"
        }`}
      >
        <span className={isAnimating ? "animate-bounce" : ""}>🗑️</span>
      </button>

      {isOnCooldown && (
        <div className="mt-1 text-2xs bg-gray-700 px-2 py-1 rounded text-gray-300">
          {cooldownTime}초 후
        </div>
      )}

      {showResult && (
        <div
          className={`mt-2 text-2xs font-bold text-yellow-400 bg-black/70 px-3 py-1 rounded animate-bounce`}
        >
          +{showResult.pointsEarned} TP
        </div>
      )}

      {!isOnCooldown && (
        <div className="mt-1 text-2xs bg-black/70 px-2 py-1 rounded whitespace-nowrap text-white">
          청소하기
        </div>
      )}
    </div>
  );
}
