export const TRADE_FEEDBACK_TYPES = {
  DELAYED_SCHEDULE: 'delayed_schedule',
  REPEATED_RESCHEDULE: 'repeated_reschedule',
  NO_SHOW_SUSPECTED: 'no_show_suspected',
  UNSAFE_PAYMENT_REQUEST: 'unsafe_payment_request',
  GOOD_TRANSACTION: 'good_transaction',
} as const;

export type TradeFeedbackType = typeof TRADE_FEEDBACK_TYPES[keyof typeof TRADE_FEEDBACK_TYPES];

export const TRADE_FEEDBACK_WEIGHTS: Record<TradeFeedbackType, number> = {
  [TRADE_FEEDBACK_TYPES.DELAYED_SCHEDULE]: -5,
  [TRADE_FEEDBACK_TYPES.REPEATED_RESCHEDULE]: -10,
  [TRADE_FEEDBACK_TYPES.NO_SHOW_SUSPECTED]: -20,
  [TRADE_FEEDBACK_TYPES.UNSAFE_PAYMENT_REQUEST]: -30,
  [TRADE_FEEDBACK_TYPES.GOOD_TRANSACTION]: 10,
};

export const MARKET_TRUST_CONFIG = {
  feedbackTypes: TRADE_FEEDBACK_TYPES,
  feedbackWeights: TRADE_FEEDBACK_WEIGHTS,
  defaultTrustScore: 100,
  minTrustScore: 0,
  maxTrustScore: 1000,
  riskThreshold: 40,
  reviewThreshold: 60,
} as const;
