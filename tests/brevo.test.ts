import { describe, expect, it, vi } from 'vitest';
import { BREVO_CONCURRENCY, createBrevoSender } from '@/lib/email/brevo';

const message = (index: number) => ({ to: [`p${index}@example.com`], subject: 's', html: 'h', text: 't' });

function sender(fetchImpl: typeof fetch) {
  return createBrevoSender({
    apiKey: 'key',
    sender: { email: 'chop@example.com', name: 'CHOP' },
    fetchImpl,
    retryDelayMs: 0,
  });
}

describe('createBrevoSender', () => {
  it('sends with the CHOP sender and api key', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('{}', { status: 201 }));
    await sender(fetchImpl).send({ ...message(1), headers: { 'List-Unsubscribe': '<https://x>' } });
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init?.headers as Record<string, string>)['api-key']).toBe('key');
    const body = JSON.parse(String(init?.body));
    expect(body.sender).toEqual({ email: 'chop@example.com', name: 'CHOP' });
    expect(body.replyTo).toEqual({ email: 'chop@example.com', name: 'CHOP' });
    expect(body.to).toEqual([{ email: 'p1@example.com' }]);
    expect(body.headers['List-Unsubscribe']).toBe('<https://x>');
  });

  it('retries transient failures but not client errors', async () => {
    const flaky = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 201 }));
    await sender(flaky).send(message(1));
    expect(flaky).toHaveBeenCalledTimes(2);

    const rejected = vi.fn<typeof fetch>(async () => new Response('bad', { status: 400 }));
    await expect(sender(rejected).send(message(1))).rejects.toThrow('400');
    expect(rejected).toHaveBeenCalledTimes(1);
  });

  it('counts delivered and failed messages in a batch', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchImpl = vi.fn<typeof fetch>(async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      return new Response('{}', { status: body.to[0].email === 'p2@example.com' ? 400 : 201 });
    });
    const messages = Array.from({ length: BREVO_CONCURRENCY + 2 }, (_, index) => message(index));
    expect(await sender(fetchImpl).sendBatch(messages, 'NL-1')).toEqual({
      delivered: BREVO_CONCURRENCY + 1,
      failed: 1,
    });
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)).tags).toEqual(['NL-1']);
  });
});
