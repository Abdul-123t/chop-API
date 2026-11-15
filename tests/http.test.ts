import { describe, expect, it } from 'vitest';
import { ValidationError } from '@/lib/errors';
import { applyCors } from '@/lib/http/cors';
import { apiRoute } from '@/lib/http/route';

const allowed = ['https://chopijebu.com'];

function requestFrom(origin: string) {
  return new Request('https://api.test', { headers: { origin } });
}

describe('applyCors', () => {
  it('allows configured origins only', () => {
    const good = applyCors(requestFrom('https://chopijebu.com'), new Response(), allowed);
    expect(good.headers.get('access-control-allow-origin')).toBe('https://chopijebu.com');
    const bad = applyCors(requestFrom('https://evil.test'), new Response(), allowed);
    expect(bad.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('apiRoute', () => {
  it('turns app errors into json responses', async () => {
    const handler = apiRoute(async () => {
      throw new ValidationError('Bad input.', [{ path: 'email', message: 'Invalid' }]);
    });
    const response = await handler(new Request('https://api.test'));
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ success: false, code: 'validation_error' });
  });

  it('hides unexpected errors', async () => {
    const handler = apiRoute(async () => {
      throw new Error('secret detail');
    });
    const response = await handler(new Request('https://api.test'));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('secret detail');
  });
});
