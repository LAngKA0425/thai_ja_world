export const COMMUNITY_CATEGORIES = {
  BRIEFING: 'briefing',
  INCIDENT: 'incident',
  ANONYMOUS_TIP: 'anonymous_tip',
  JOB: 'job',
  ERRAND: 'errand',
  MARKET: 'market',
  VISA_INFO: 'visa_info',
  LOCAL_TIP: 'local_tip',
} as const;

export type CommunityCategory = typeof COMMUNITY_CATEGORIES[keyof typeof COMMUNITY_CATEGORIES];

export const HOME_SECTIONS = {
  TODAY_BRIEFING: 'today_briefing',
  INCIDENT_REPORTS: 'incident_reports',
  LATEST_JOBS: 'latest_jobs',
  LATEST_MARKET: 'latest_market',
  LOCAL_TIPS: 'local_tips',
  TRENDING_POSTS: 'trending_posts',
  SAFETY_NOTICE: 'safety_notice',
} as const;

export type HomeSection = typeof HOME_SECTIONS[keyof typeof HOME_SECTIONS];

export const CONTENT_MODERATION_STATUS = {
  SAFE: 'safe',
  REVIEW: 'review',
  BLOCKED: 'blocked',
} as const;

export type ContentModerationStatus = typeof CONTENT_MODERATION_STATUS[keyof typeof CONTENT_MODERATION_STATUS];

export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type IncidentSeverity = typeof INCIDENT_SEVERITY[keyof typeof INCIDENT_SEVERITY];

export const COMMUNITY_CONFIG = {
  categories: COMMUNITY_CATEGORIES,
  homeSections: HOME_SECTIONS,
  moderationStatus: CONTENT_MODERATION_STATUS,
  incidentSeverity: INCIDENT_SEVERITY,
  anonymousCategories: [COMMUNITY_CATEGORIES.INCIDENT, COMMUNITY_CATEGORIES.ANONYMOUS_TIP],
  maxAnonymousPostsPerDay: 3,
} as const;
