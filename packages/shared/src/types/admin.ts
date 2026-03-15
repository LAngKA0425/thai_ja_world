export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalTransactions: number;
  totalGemsSold: number;
  totalPointsDistributed: number;
  totalReports: number;
  pendingReports: number;
  averageDailyActiveUsers: number;
  lastUpdated: Date;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: "MAINTENANCE" | "EVENT" | "PATCH" | "ANNOUNCEMENT" | "WARNING";
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  details: Record<string, any>;
  createdAt: Date;
}

export interface UserSearchResult {
  id: string;
  email: string;
  nickname: string;
  role: string;
  status: string;
  createdAt: Date;
  lastLoginAt?: Date;
}
