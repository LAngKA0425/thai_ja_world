export const MAX_BLOCKS_PER_USER = 100;

export const REPORT_REASONS = {
  HARASSMENT: "괴롭힘",
  SPAM: "스팸",
  OFFENSIVE_CONTENT: "불쾌한 내용",
  SCAM: "사기",
  INAPPROPRIATE_USERNAME: "부적절한 닉네임",
  IMPERSONATION: "사칭",
  SEXUAL_CONTENT: "성적 콘텐츠",
  VIOLENCE: "폭력",
  OTHER: "기타",
} as const;

export const SANCTION_DURATIONS = {
  WARNING: 0,
  MUTE: 3600000,
  TEMP_BAN: 86400000,
  PERMANENT_BAN: null,
} as const;

export const MODERATION_CONFIG = {
  maxBlocksPerUser: MAX_BLOCKS_PER_USER,
  reportReasons: REPORT_REASONS,
  sanctionDurations: SANCTION_DURATIONS,
  autoReviewThreshold: 3,
  reportRetentionDays: 90,
  sanctionAppealDelayHours: 24,
  maxReportsPerUserPerDay: 5,
} as const;
