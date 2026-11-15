import { sign, verify } from '@/lib/security/signing';
import { sessionPayloadSchema, type SessionPayload } from '@/modules/auth/auth.schema';

const PURPOSE = 'admin-session';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function issueSessionToken(
  email: string,
  secret: string,
  now = Date.now()
): { token: string; expiresAt: number; email: string } {
  const payload: SessionPayload = { sub: email, exp: now + SESSION_TTL_MS };
  return { token: sign(PURPOSE, JSON.stringify(payload), secret), expiresAt: payload.exp, email };
}

export function readSessionToken(token: string, secret: string, now = Date.now()): SessionPayload | null {
  const raw = verify(PURPOSE, token, secret);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const payload = sessionPayloadSchema.safeParse(parsed);
  if (!payload.success || payload.data.exp <= now) return null;
  return payload.data;
}
