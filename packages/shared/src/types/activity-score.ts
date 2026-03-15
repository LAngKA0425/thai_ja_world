import type { ActivityScoreSourceType, TrustLevel } from '../constants/activity-score';

export interface ActivityScore {
  id: string;
  userId: string;
  totalScore: number;
  trustLevel: TrustLevel;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityScoreLog {
  id: string;
  userId: string;
  sourceType: ActivityScoreSourceType;
  delta: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ActivityScoreSummary {
  userId: string;
  totalScore: number;
  trustLevel: TrustLevel;
  recentLogs: ActivityScoreLog[];
}
