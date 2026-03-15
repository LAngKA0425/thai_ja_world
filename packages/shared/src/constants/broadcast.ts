export const BROADCAST_MAX_LENGTH = 50;
export const BROADCAST_COOLDOWN_MS = 60000;

export const BROADCAST_TYPES = {
  NORMAL: {
    name: "Normal",
    maxLength: 50,
    cooldownMs: 60000,
    durationMs: 120000,
    price: 100,
    description: "Basic broadcast visible to plaza",
  },
  PREMIUM: {
    name: "Premium",
    maxLength: 100,
    cooldownMs: 30000,
    durationMs: 300000,
    price: 500,
    description: "Extended broadcast with longer duration and visibility",
  },
} as const;

export const BROADCAST_CONFIG = {
  maxLength: BROADCAST_MAX_LENGTH,
  cooldownMs: BROADCAST_COOLDOWN_MS,
  types: BROADCAST_TYPES,
  messageRetentionCount: 50,
  archiveRetentionDays: 30,
  defaultDurationMs: 120000,
  maxConcurrentBroadcasts: 10,
} as const;
