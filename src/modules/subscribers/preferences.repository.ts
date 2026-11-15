import { getDb } from '@/lib/db/client';
import { normalizeEmail } from '@/lib/security/unsubscribeToken';

export const preferencesRepository = {
  async unsubscribedEmails(): Promise<Set<string>> {
    const rows = await getDb().emailPreference.findMany({
      where: { unsubscribedAt: { not: null } },
      select: { email: true },
    });
    return new Set(rows.map((row) => row.email));
  },

  async isUnsubscribed(email: string): Promise<boolean> {
    const row = await getDb().emailPreference.findUnique({ where: { email: normalizeEmail(email) } });
    return Boolean(row?.unsubscribedAt);
  },

  async unsubscribe(email: string, source: string): Promise<void> {
    const normalized = normalizeEmail(email);
    await getDb().emailPreference.upsert({
      where: { email: normalized },
      create: { email: normalized, unsubscribedAt: new Date(), source },
      update: { unsubscribedAt: new Date(), source },
    });
  },
};
