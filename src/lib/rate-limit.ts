import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

let loginLimiterInstance: Ratelimit | null = null;
let registerLimiterInstance: Ratelimit | null = null;

function getLoginLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!loginLimiterInstance) {
    loginLimiterInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'rl:login',
    });
  }
  return loginLimiterInstance;
}

function getRegisterLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!registerLimiterInstance) {
    registerLimiterInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, '1 h'),
      prefix: 'rl:register',
    });
  }
  return registerLimiterInstance;
}

export async function checkLoginRateLimit(
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  const limiter = getLoginLimiter();
  if (!limiter) return { success: true, reset: 0 };
  const result = await limiter.limit(identifier);
  return { success: result.success, reset: result.reset };
}

export async function checkRegisterRateLimit(
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  const limiter = getRegisterLimiter();
  if (!limiter) return { success: true, reset: 0 };
  const result = await limiter.limit(identifier);
  return { success: result.success, reset: result.reset };
}
