"use client";

import { useEffect, useState } from "react";
import type { QuestDefinition, UserQuestState } from "../types/quests.types";
import { DAILY_MAX_POINTS } from "../constants/dailyQuest.constants";
import { fetchDailyQuests, fetchMyQuestStates } from "../api/quests.api";
import DailyQuestCard from "./DailyQuestCard";

export default function DailyQuestList() {
  const [quests, setQuests] = useState<QuestDefinition[]>([]);
  const [questStates, setQuestStates] = useState<UserQuestState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [questsData, statesData] = await Promise.all([
        fetchDailyQuests(),
        fetchMyQuestStates(),
      ]);
      setQuests(questsData);
      setQuestStates(statesData);
    } catch (err) {
      setError("퀘스트를 불러올 수 없습니다.");
      console.error("Failed to load quests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPoints = () => {
    return questStates.reduce((total, state) => {
      if (state.isRewarded) {
        const quest = quests.find((q) => q.id === state.questId);
        return total + (quest?.rewardPoints ?? 0);
      }
      return total;
    }, 0);
  };

  const completedQuestCount = questStates.filter(
    (state) => state.completedCount > 0
  ).length;
  const totalPoints = calculateTotalPoints();

  const handleQuestComplete = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 rounded-lg shadow-card">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-lg shadow-card text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 rounded-lg shadow-card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xs text-gray-400 mb-1">완료한 퀘스트</p>
            <p className="text-lg font-bold">
              {completedQuestCount}
              <span className="text-gray-400 text-sm">/{quests.length}</span>
            </p>
          </div>
          <div>
            <p className="text-2xs text-gray-400 mb-1">일일 보상</p>
            <p className="text-lg font-bold">
              {totalPoints}
              <span className="text-gray-400 text-sm">/{DAILY_MAX_POINTS}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {quests.map((quest) => {
          const questState = questStates.find((s) => s.questId === quest.id);
          return (
            <DailyQuestCard
              key={quest.id}
              quest={quest}
              questState={questState}
              onComplete={handleQuestComplete}
            />
          );
        })}
      </div>
    </div>
  );
}
