import type { TradeFeedbackType } from '../constants/market-trust';

export interface TradePartnerFeedback {
  id: string;
  tradeId: string;
  reporterUserId: string;
  targetUserId: string;
  feedbackType: TradeFeedbackType;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface UserTrustScore {
  id: string;
  userId: string;
  trustScore: number;
  totalTrades: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  riskFlag: boolean;
  lastComputedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
