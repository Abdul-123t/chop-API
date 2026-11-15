import { getEnv } from '@/config/env';
import { UnauthorizedError } from '@/lib/errors';
import { hashPassword, verifyPassword } from '@/lib/security/password';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { parseWith } from '@/lib/validation';
import { adminsRepository } from '@/modules/admins/admins.repository';
import { loginSchema, type AdminSession } from '@/modules/auth/auth.schema';
import { issueSessionToken, readSessionToken } from '@/modules/auth/session.token';

const loginLimiter = createRateLimiter(15 * 60 * 1000, 5);
const DECOY_HASH = hashPassword('decoy-password-for-timing');

export const authService = {
  async login(input: unknown, clientIp: string) {
    loginLimiter.enforce(clientIp);
    const { email, password } = parseWith(loginSchema, input);
    const admin = await adminsRepository.findByEmail(email);
    const passwordMatches = verifyPassword(password, admin?.passwordHash ?? DECOY_HASH);
    if (!admin || !passwordMatches) throw new UnauthorizedError('Incorrect email or password.');

    await adminsRepository.recordLogin(admin.id);
    const session = issueSessionToken(admin.id, getEnv().APP_SECRET);
    return { ...session, email: admin.email, name: admin.name };
  },

  async verify(token: string): Promise<AdminSession | null> {
    if (!token) return null;
    const payload = readSessionToken(token, getEnv().APP_SECRET);
    if (!payload) return null;
    const admin = await adminsRepository.findById(payload.sub);
    return admin ? { ...admin, expiresAt: payload.exp } : null;
  },
};
