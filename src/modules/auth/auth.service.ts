import { getEnv } from '@/config/env';
import { UnauthorizedError } from '@/lib/errors';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { safeEqual } from '@/lib/security/signing';
import { parseWith } from '@/lib/validation';
import { loginSchema, type SessionPayload } from '@/modules/auth/auth.schema';
import { issueSessionToken, readSessionToken } from '@/modules/auth/session.token';

const loginLimiter = createRateLimiter(15 * 60 * 1000, 5);

export const authService = {
  login(input: unknown, clientIp: string) {
    loginLimiter.enforce(clientIp);
    const { password } = parseWith(loginSchema, input);
    const env = getEnv();
    if (!safeEqual(password, env.ADMIN_PASSWORD)) throw new UnauthorizedError('Incorrect password.');
    return issueSessionToken(env.APP_SECRET);
  },

  verify(token: string): SessionPayload | null {
    return token ? readSessionToken(token, getEnv().APP_SECRET) : null;
  },
};
