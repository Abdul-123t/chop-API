import { normalizeEmail } from '@/lib/security/unsubscribeToken';
import { fromCell, toCell } from '@/lib/sheets/cells';
import { appendRows, readRows } from '@/lib/sheets/table';
import { PREFERENCES_TAB } from '@/lib/sheets/tabs';

export type PreferenceStatus = 'unsubscribed' | 'subscribed';

export function latestStatuses(rows: unknown[][]): Map<string, PreferenceStatus> {
  const statuses = new Map<string, PreferenceStatus>();
  for (const row of rows) {
    const email = normalizeEmail(fromCell(row[0]));
    const status = fromCell(row[1]).trim().toLowerCase();
    if (email && (status === 'unsubscribed' || status === 'subscribed')) statuses.set(email, status);
  }
  return statuses;
}

export const preferencesRepository = {
  async unsubscribedEmails(): Promise<Set<string>> {
    const statuses = latestStatuses(await readRows(PREFERENCES_TAB));
    return new Set([...statuses].filter(([, status]) => status === 'unsubscribed').map(([email]) => email));
  },

  async record(email: string, status: PreferenceStatus, source: string): Promise<void> {
    await appendRows(PREFERENCES_TAB, [[toCell(normalizeEmail(email)), status, new Date().toISOString(), toCell(source)]]);
  },
};
