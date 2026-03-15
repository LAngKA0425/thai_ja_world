"use client";

import { apiFetch } from "@/lib/api";
import type { QuestDefinition, UserQuestState } from "../types/quests.types";

export async function fetchDailyQuests(): Promise<QuestDefinition[]> {
  return apiFetch<QuestDefinition[]>("/quests/daily");
}

export async function fetchMyQuestStates(): Promise<UserQuestState[]> {
  return apiFetch<UserQuestState[]>("/quests/my-states");
}

export async function completeQuest(questId: string): Promise<{
  success: boolean;
  pointsEarned: number;
  message: string;
}> {
  return apiFetch(`/quests/${questId}/complete`, {
    method: "POST",
  });
}
