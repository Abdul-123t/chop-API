import type { BatchResult, EmailMessage, EmailSender } from '@/lib/email/types';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
export const BREVO_CONCURRENCY = 5;

export interface Mailbox {
  email: string;
  name?: string;
}

interface BrevoOptions {
  apiKey: string;
  sender: Mailbox;
  replyTo?: Mailbox;
  fetchImpl?: typeof fetch;
  retryDelayMs?: number;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

export function createBrevoSender({
  apiKey,
  sender,
  replyTo,
  fetchImpl = fetch,
  retryDelayMs = 800,
}: BrevoOptions): EmailSender {
  function toPayload(message: EmailMessage, tag?: string) {
    return {
      sender,
      replyTo: replyTo ?? sender,
      to: message.to.map((email) => ({ email })),
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      ...(message.headers ? { headers: message.headers } : {}),
      ...(tag ? { tags: [tag] } : {}),
    };
  }

  async function deliver(message: EmailMessage, tag?: string): Promise<void> {
    const body = JSON.stringify(toPayload(message, tag));
    let lastError = '';
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetchImpl(BREVO_ENDPOINT, {
          method: 'POST',
          headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
          body,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (response.ok) return;
        lastError = `Brevo responded with ${response.status}: ${(await response.text().catch(() => '')).slice(0, 300)}`;
        if (!isRetryable(response.status)) break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
      if (attempt < MAX_ATTEMPTS) await pause(retryDelayMs * attempt);
    }
    throw new Error(lastError || 'Brevo request failed.');
  }

  return {
    send(message) {
      return deliver(message);
    },

    async sendBatch(messages, batchId): Promise<BatchResult> {
      let delivered = 0;
      let failed = 0;
      for (let start = 0; start < messages.length; start += BREVO_CONCURRENCY) {
        const chunk = messages.slice(start, start + BREVO_CONCURRENCY);
        const results = await Promise.allSettled(chunk.map((message) => deliver(message, batchId)));
        for (const result of results) {
          if (result.status === 'fulfilled') {
            delivered += 1;
          } else {
            failed += 1;
            console.error('[email] Delivery failed.', result.reason instanceof Error ? result.reason.message : result.reason);
          }
        }
      }
      return { delivered, failed };
    },
  };
}
