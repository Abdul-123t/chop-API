import { fromCell, toCell } from '@/lib/sheets/cells';
import { appendRows, readRows } from '@/lib/sheets/table';
import { NEWSLETTER_LOG_TAB } from '@/lib/sheets/tabs';
import type { NewsletterLogEntry } from '@/modules/newsletter/newsletter.types';

const toNumber = (value: unknown) => Number.parseInt(fromCell(value), 10) || 0;

export const newsletterRepository = {
  async log(entry: NewsletterLogEntry): Promise<void> {
    await appendRows(NEWSLETTER_LOG_TAB, [
      [
        entry.id,
        entry.sentAt,
        toCell(entry.subject),
        toCell(entry.audience),
        String(entry.recipients),
        String(entry.delivered),
        String(entry.failed),
      ],
    ]);
  },

  async history(): Promise<NewsletterLogEntry[]> {
    const rows = await readRows(NEWSLETTER_LOG_TAB);
    return rows
      .filter((row) => fromCell(row[0]))
      .map((row) => ({
        id: fromCell(row[0]),
        sentAt: fromCell(row[1]),
        subject: fromCell(row[2]),
        audience: fromCell(row[3]),
        recipients: toNumber(row[4]),
        delivered: toNumber(row[5]),
        failed: toNumber(row[6]),
      }))
      .reverse();
  },
};
