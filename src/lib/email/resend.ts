import type { BatchResult, EmailMessage, EmailSender } from '@/lib/email/types';

const RESEND_API = 'https://api.resend.com';
export const RESEND_BATCH_SIZE = 100;
const BATCH_PAUSE_MS = 600;

interface ResendOptions {
  apiKey: string;
  from: string;
  replyTo?: string;
  fetchImpl?: typeof fetch;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createResendSender({ apiKey, from, replyTo, fetchImpl = fetch }: ResendOptions): EmailSender {
  function toPayload(message: EmailMessage) {
    return {
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(message.headers ? { headers: message.headers } : {}),
    };
  }

  async function post(path: string, body: unknown, idempotencyKey?: string): Promise<void> {
    const response = await fetchImpl(`${RESEND_API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend responded with ${response.status}: ${detail.slice(0, 300)}`);
    }
  }

  return {
    async send(message) {
      await post('/emails', toPayload(message));
    },

    async sendBatch(messages, idempotencyKey): Promise<BatchResult> {
      let delivered = 0;
      let failed = 0;
      for (let start = 0; start < messages.length; start += RESEND_BATCH_SIZE) {
        const chunk = messages.slice(start, start + RESEND_BATCH_SIZE);
        try {
          await post('/emails/batch', chunk.map(toPayload), `${idempotencyKey}-${start / RESEND_BATCH_SIZE}`);
          delivered += chunk.length;
        } catch (error) {
          failed += chunk.length;
          console.error('[email] Batch failed.', error instanceof Error ? error.message : error);
        }
        if (start + RESEND_BATCH_SIZE < messages.length) await pause(BATCH_PAUSE_MS);
      }
      return { delivered, failed };
    },
  };
}
