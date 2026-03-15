// In-memory sliding window rate limiter for Next.js API routes
// Production: Redis 기반으로 교체 권장

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 86400000)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}, 300000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export const RATE_LIMITS = {
  signup: { maxRequests: 5, windowMs: 60000 } as RateLimitConfig,
  login: { maxRequests: 10, windowMs: 60000 } as RateLimitConfig,
  resendVerification: { maxRequests: 3, windowMs: 60000 } as RateLimitConfig,
  verifyEmail: { maxRequests: 10, windowMs: 60000 } as RateLimitConfig,
} as const

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs)

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = oldestInWindow + config.windowMs - now
    return { allowed: false, retryAfterMs }
  }

  entry.timestamps.push(now)
  return { allowed: true, retryAfterMs: 0 }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}
