import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}

function signature(purpose: string, value: string, secret: string): string {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('base64url');
}

export function sign(purpose: string, value: string, secret: string): string {
  return `${Buffer.from(value, 'utf8').toString('base64url')}.${signature(purpose, value, secret)}`;
}

export function verify(purpose: string, token: string, secret: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const value = Buffer.from(parts[0], 'base64url').toString('utf8');
  return safeEqual(parts[1], signature(purpose, value, secret)) ? value : null;
}
