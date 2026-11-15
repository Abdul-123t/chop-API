import { getEnv } from '@/config/env';
import { UnauthorizedError } from '@/lib/errors';
import { verifyPassword } from '@/lib/security/password';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { safeEqual } from '@/lib/security/signing';
import { parseWith } from '@/lib/validation';
import { loginSchema, type SessionPayload } from '@/modules/auth/auth.schema';
import { issueSessionToken, readSessionToken } from '@/modules/auth/session.token';

const loginLimiter = createRateLimiter(15 * 60 * 1000, 5);

export const authService = {
  login(input: unknown, clientIp: string) {
    loginLimiter.enforce(clientIp);
    const { email, password } = parseWith(loginSchema, input);
    const env = getEnv();
    const passwordMatches = verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    if (!safeEqual(email, env.ADMIN_EMAIL) || !passwordMatches) {
      throw new UnauthorizedError('Incorrect email or password.');
    }
    return issueSessionToken(env.ADMIN_EMAIL, env.APP_SECRET);
  },

  verify(token: string): SessionPayload | null {
    if (!token) return null;
    const env = getEnv();
    const session = readSessionToken(token, env.APP_SECRET);
    return session && session.sub === env.ADMIN_EMAIL ? session : null;
  },
};
