export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  questType: "daily_login" | "write_post" | "visit_minihome" | "write_comment" | "like_post" | "guestbook_write" | "miniroom_trash";
  rewardPoints: number;
  maxCompletionsPerDay: number;
  isActive: boolean;
}

export interface UserQuestState {
  questId: string;
  userId: string;
  completedCount: number;
  isRewarded: boolean;
  date: string;
}

export type QuestStatus = "available" | "in_progress" | "completed" | "rewarded";
