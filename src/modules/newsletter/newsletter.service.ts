import { randomUUID } from 'node:crypto';
import { ValidationError } from '@/lib/errors';
import { requireEmailSender } from '@/lib/email/sender';
import { parseWith } from '@/lib/validation';
import { subscribersRepository } from '@/modules/subscribers/subscribers.repository';
import { describeAudience, selectRecipients } from '@/modules/newsletter/newsletter.audience';
import { composeMessage, renderPreview } from '@/modules/newsletter/newsletter.composer';
import { newsletterRepository } from '@/modules/newsletter/newsletter.repository';
import {
  contentSchema,
  sendNewsletterSchema,
  testNewsletterSchema,
} from '@/modules/newsletter/newsletter.schema';
import type { NewsletterLogEntry } from '@/modules/newsletter/newsletter.types';

export const newsletterService = {
  preview(input: unknown) {
    return renderPreview(parseWith(contentSchema, input));
  },

  async sendTest(input: unknown) {
    const { to, ...content } = parseWith(testNewsletterSchema, input);
    const message = composeMessage(content, { email: to, name: 'there' });
    await requireEmailSender().send({ ...message, subject: `[Test] ${message.subject}` });
    return { to };
  },

  async send(input: unknown): Promise<NewsletterLogEntry> {
    const { audience, ...content } = parseWith(sendNewsletterSchema, input);
    const sender = requireEmailSender();
    const recipients = selectRecipients(await subscribersRepository.list(), audience);
    if (recipients.length === 0) {
      throw new ValidationError('No subscribed people with an email address match this audience.');
    }

    const id = `NL-${randomUUID()}`;
    const result = await sender.sendBatch(
      recipients.map((recipient) => composeMessage(content, recipient)),
      id
    );

    const entry: NewsletterLogEntry = {
      id,
      sentAt: new Date().toISOString(),
      subject: content.subject,
      audience: describeAudience(audience),
      recipients: recipients.length,
      ...result,
    };
    await newsletterRepository.log(entry);
    return entry;
  },

  history() {
    return newsletterRepository.history();
  },
};
