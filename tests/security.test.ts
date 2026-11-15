import { describe, expect, it } from 'vitest';
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
    const { token } = issueSessionToken(secret, now);
    expect(readSessionToken(token, secret, now + 1000)?.sub).toBe('admin');
    expect(readSessionToken(token, secret, now + SESSION_TTL_MS + 1)).toBeNull();
  });

  it('cannot be used as unsubscribe tokens', () => {
    const { token } = issueSessionToken(secret);
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
