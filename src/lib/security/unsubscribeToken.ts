import { sign, verify } from '@/lib/security/signing';

const PURPOSE = 'unsubscribe';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createUnsubscribeToken(email: string, secret: string): string {
  return sign(PURPOSE, normalizeEmail(email), secret);
}

export function readUnsubscribeToken(token: string, secret: string): string | null {
  return verify(PURPOSE, token, secret);
}
