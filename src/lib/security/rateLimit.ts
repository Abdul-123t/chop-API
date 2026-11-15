import { RateLimitError } from '@/lib/errors';

interface Entry {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 5000;

export function createRateLimiter(windowMs: number, maxRequests: number) {
  const entries = new Map<string, Entry>();

  function prune(now: number) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
    while (entries.size > MAX_KEYS) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  }

  return {
    consume(key: string): boolean {
      const now = Date.now();
      prune(now);
      const entry = entries.get(key);
      if (!entry || entry.resetAt <= now) {
        entries.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (entry.count >= maxRequests) return false;
      entry.count += 1;
      return true;
    },
    enforce(key: string): void {
      if (!this.consume(key)) throw new RateLimitError();
    },
  };
}
