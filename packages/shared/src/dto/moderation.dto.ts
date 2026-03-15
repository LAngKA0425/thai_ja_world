import type { ReportReason, ReportStatus } from "../types/moderation";

export interface CreateReportDTO {
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  description: string;
  evidence?: string[];
}

export interface ReportResponseDTO {
  success: boolean;
  message: string;
  reportId?: string;
  error?: string;
}

export interface BlockUserDTO {
  userId: string;
  blockedUserId: string;
  reason?: string;
}

export interface UnblockUserDTO {
  userId: string;
  blockedUserId: string;
}

export interface ReportDetailsDTO {
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
}

export interface ReviewReportDTO {
  reportId: string;
  reviewedBy: string;
  decision: "RESOLVED" | "DISMISSED" | "ESCALATED";
  resolution?: string;
  sanctionType?: "WARNING" | "MUTE" | "TEMP_BAN" | "PERMANENT_BAN";
  sanctionDuration?: number;
}

export interface ReviewReportResponseDTO {
  success: boolean;
  message: string;
  error?: string;
}

export interface ReportListDTO {
  reports: ReportDetailsDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
  filters?: {
    status?: ReportStatus;
    reason?: ReportReason;
  };
}

export interface BlockListDTO {
  userId: string;
  blockedUsers: Array<{
    userId: string;
    nickname: string;
    reason?: string;
    blockedAt: Date;
  }>;
  totalCount: number;
}

export interface SanctionDetailsDTO {
  id: string;
  userId: string;
  userNickname: string;
  type: string;
  reason: string;
  duration?: number;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface AppealsanctionDTO {
  sanctionId: string;
  userId: string;
  appealReason: string;
}

export interface AppealResponseDTO {
  success: boolean;
  message: string;
  appealId?: string;
  error?: string;
}
