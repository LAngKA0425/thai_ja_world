export enum ReportReason {
  HARASSMENT = "HARASSMENT",
  SPAM = "SPAM",
  OFFENSIVE_CONTENT = "OFFENSIVE_CONTENT",
  SCAM = "SCAM",
  INAPPROPRIATE_USERNAME = "INAPPROPRIATE_USERNAME",
  IMPERSONATION = "IMPERSONATION",
  SEXUAL_CONTENT = "SEXUAL_CONTENT",
  VIOLENCE = "VIOLENCE",
  OTHER = "OTHER",
}

export enum ReportStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export enum SanctionType {
  WARNING = "WARNING",
  MUTE = "MUTE",
  TEMP_BAN = "TEMP_BAN",
  PERMANENT_BAN = "PERMANENT_BAN",
}

export interface Report {
  id: string;
  reporterId: string;
  reporterNickname: string;
  reportedUserId: string;
  reportedUserNickname: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  evidence?: string[];
  reviewedBy?: string;
  reviewedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sanction {
  id: string;
  userId: string;
  userNickname: string;
  type: SanctionType;
  reason: string;
  reportId?: string;
  duration?: number;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface BlockRecord {
  id: string;
  userId: string;
  blockedUserId: string;
  reason?: string;
  createdAt: Date;
}
