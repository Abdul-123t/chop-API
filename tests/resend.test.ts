import { describe, expect, it, vi } from 'vitest';
import { createResendSender, RESEND_BATCH_SIZE } from '@/lib/email/resend';

const message = (index: number) => ({ to: [`p${index}@example.com`], subject: 's', html: 'h', text: 't' });

describe('createResendSender', () => {
  it('splits batches and counts failures per chunk', async () => {
    let call = 0;
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      call += 1;
      return new Response('{}', { status: call === 2 ? 500 : 200 });
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sender = createResendSender({
      apiKey: 'k',
      from: 'CHOP <hello@example.com>',
      fetchImpl,
    });
    const messages = Array.from({ length: RESEND_BATCH_SIZE + 5 }, (_, index) => message(index));

    const result = await sender.sendBatch(messages, 'NL-1');

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ delivered: RESEND_BATCH_SIZE, failed: 5 });
    const init = fetchImpl.mock.calls[0]?.[1];
    expect((init?.headers as Record<string, string>)['Idempotency-Key']).toBe('NL-1-0');
  });
});
