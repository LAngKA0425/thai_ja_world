"use client";

import { useState } from "react";
import type { QuestDefinition, UserQuestState } from "../types/quests.types";
import { DAILY_QUEST_TYPES, QUEST_REWARD_ANIMATION_DURATION } from "../constants/dailyQuest.constants";
import { completeQuest } from "../api/quests.api";
import QuestRewardBadge from "./QuestRewardBadge";

interface DailyQuestCardProps {
  quest: QuestDefinition;
  questState?: UserQuestState;
  onComplete?: (questId: string) => void;
}

export default function DailyQuestCard({
  quest,
  questState,
  onComplete,
}: DailyQuestCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const questTypeInfo = DAILY_QUEST_TYPES[quest.questType];

  const isCompleted = questState && questState.completedCount > 0;
  const isRewarded = questState?.isRewarded ?? false;
  const progressPercentage = questState
    ? (questState.completedCount / quest.maxCompletionsPerDay) * 100
    : 0;

  const handleComplete = async () => {
    if (isLoading || isCompleted) return;

    setIsLoading(true);
    try {
      const result = await completeQuest(quest.id);
      if (result.success) {
        setShowRewardAnimation(true);
        setTimeout(() => {
          setShowRewardAnimation(false);
        }, QUEST_REWARD_ANIMATION_DURATION);
        onComplete?.(quest.id);
      }
    } catch (error) {
      console.error("Failed to complete quest:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 rounded-lg shadow-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl">{questTypeInfo.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{questTypeInfo.label}</h3>
            <p className="text-2xs text-gray-400">{quest.description}</p>
          </div>
        </div>
        <QuestRewardBadge
          points={quest.rewardPoints}
          animated={showRewardAnimation}
        />
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-2xs text-gray-400">진행도</span>
          <span className="text-2xs font-medium">
            {questState?.completedCount ?? 0}/{quest.maxCompletionsPerDay}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleComplete}
        disabled={isLoading || isCompleted || !quest.isActive}
        className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
          isCompleted || !quest.isActive
            ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
        }`}
      >
        {isLoading
          ? "진행 중..."
          : isCompleted
            ? isRewarded
              ? "보상 완료"
              : "완료됨"
            : "완료하기"}
      </button>
    </div>
  );
}
