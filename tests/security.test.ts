import { describe, expect, it } from 'vitest';
import { generatePassword, hashPassword, verifyPassword } from '@/lib/security/password';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { createUnsubscribeToken, readUnsubscribeToken } from '@/lib/security/unsubscribeToken';
import { issueSessionToken, readSessionToken, SESSION_TTL_MS } from '@/modules/auth/session.token';

const secret = 'x'.repeat(40);

describe('unsubscribe tokens', () => {
  it('round-trips a normalized email', () => {
    const token = createUnsubscribeToken(' Ada@Example.com ', secret);
    expect(readUnsubscribeToken(token, secret)).toBe('ada@example.com');
  });

  it('rejects tampered or foreign tokens', () => {
    const token = createUnsubscribeToken('ada@example.com', secret);
    expect(readUnsubscribeToken(`${token}x`, secret)).toBeNull();
    expect(readUnsubscribeToken(token, 'y'.repeat(40))).toBeNull();
    expect(readUnsubscribeToken('garbage', secret)).toBeNull();
  });
});

describe('session tokens', () => {
  it('are valid until they expire', () => {
    const now = 1_000_000;
    const { token } = issueSessionToken('admin@example.com', secret, now);
    expect(readSessionToken(token, secret, now + 1000)?.sub).toBe('admin@example.com');
    expect(readSessionToken(token, secret, now + SESSION_TTL_MS + 1)).toBeNull();
  });

  it('cannot be used as unsubscribe tokens', () => {
    const { token } = issueSessionToken('admin@example.com', secret);
    expect(readUnsubscribeToken(token, secret)).toBeNull();
  });
});

describe('rate limiter', () => {
  it('blocks after the limit', () => {
    const limiter = createRateLimiter(60_000, 2);
    expect(limiter.consume('ip')).toBe(true);
    expect(limiter.consume('ip')).toBe(true);
    expect(limiter.consume('ip')).toBe(false);
    expect(limiter.consume('other')).toBe(true);
  });
});

describe('password hashing', () => {
  it('verifies the right password only', () => {
    const hash = hashPassword('correct horse battery');
    expect(hash).toMatch(/^scrypt:16384:8:1:/);
    expect(verifyPassword('correct horse battery', hash)).toBe(true);
    expect(verifyPassword('wrong password', hash)).toBe(false);
    expect(verifyPassword('correct horse battery', 'garbage')).toBe(false);
  });

  it('generates strong passwords', () => {
    expect(generatePassword()).toMatch(/^[A-Za-z0-9]{20}$/);
  });
});
