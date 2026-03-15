export const ACTIVITY_SCORE_SOURCE_TYPES = {
  DAILY_CHECKIN: 'daily_checkin',
  POST_CREATE: 'post_create',
  COMMENT_CREATE: 'comment_create',
  MARKET_COMPLETE: 'market_complete',
  REPORT_CONFIRMED_AGAINST: 'report_confirmed_against',
  FEATURED_POST: 'featured_post',
  ADMIN_ADJUST: 'admin_adjust',
} as const;

export type ActivityScoreSourceType = typeof ACTIVITY_SCORE_SOURCE_TYPES[keyof typeof ACTIVITY_SCORE_SOURCE_TYPES];

export const ACTIVITY_SCORE_DELTAS: Record<ActivityScoreSourceType, number> = {
  [ACTIVITY_SCORE_SOURCE_TYPES.DAILY_CHECKIN]: 10,
  [ACTIVITY_SCORE_SOURCE_TYPES.POST_CREATE]: 5,
  [ACTIVITY_SCORE_SOURCE_TYPES.COMMENT_CREATE]: 2,
  [ACTIVITY_SCORE_SOURCE_TYPES.MARKET_COMPLETE]: 15,
  [ACTIVITY_SCORE_SOURCE_TYPES.REPORT_CONFIRMED_AGAINST]: -20,
  [ACTIVITY_SCORE_SOURCE_TYPES.FEATURED_POST]: 30,
  [ACTIVITY_SCORE_SOURCE_TYPES.ADMIN_ADJUST]: 0,
};

export const ACTIVITY_SCORE_DAILY_CAPS: Partial<Record<ActivityScoreSourceType, number>> = {
  [ACTIVITY_SCORE_SOURCE_TYPES.POST_CREATE]: 25,
  [ACTIVITY_SCORE_SOURCE_TYPES.COMMENT_CREATE]: 10,
};

export const TRUST_LEVEL_THRESHOLDS = {
  NEW: 0,
  BASIC: 50,
  TRUSTED: 200,
  VERIFIED: 500,
  ELITE: 1000,
} as const;

export type TrustLevel = keyof typeof TRUST_LEVEL_THRESHOLDS;

export const ACTIVITY_SCORE_CONFIG = {
  sourceTypes: ACTIVITY_SCORE_SOURCE_TYPES,
  deltas: ACTIVITY_SCORE_DELTAS,
  dailyCaps: ACTIVITY_SCORE_DAILY_CAPS,
  trustLevelThresholds: TRUST_LEVEL_THRESHOLDS,
  antiAbuseWindowMinutes: 5,
  antiAbuseMaxActionsPerWindow: 3,
} as const;
