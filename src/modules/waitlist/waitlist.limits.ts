import { createRateLimiter } from '@/lib/security/rateLimit';

export const waitlistLimiter = createRateLimiter(10 * 60 * 1000, 8);
