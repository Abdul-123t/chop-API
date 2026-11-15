import { getDb } from '@/lib/db/client';
import type { NewsletterLogEntry } from '@/modules/newsletter/newsletter.types';

const HISTORY_LIMIT = 50;

export interface NewsletterRecord extends NewsletterLogEntry {
  message: string;
  sentBy: string;
}

export const newsletterRepository = {
  async log(record: NewsletterRecord): Promise<void> {
    await getDb().newsletter.create({
      data: { ...record, sentAt: new Date(record.sentAt) },
    });
  },

  async history(): Promise<NewsletterLogEntry[]> {
    const rows = await getDb().newsletter.findMany({
      orderBy: { sentAt: 'desc' },
      take: HISTORY_LIMIT,
      select: { id: true, sentAt: true, subject: true, audience: true, recipients: true, delivered: true, failed: true },
    });
    return rows.map((row) => ({ ...row, sentAt: row.sentAt.toISOString() }));
  },
};
