import type { Prisma } from '@/generated/prisma/client';
import { getDb } from '@/lib/db/client';
import { isNotFound } from '@/lib/db/errors';
import { preferencesRepository } from '@/modules/subscribers/preferences.repository';
import { toSubscriber } from '@/modules/subscribers/subscriber.mapper';
import type { Subscriber } from '@/modules/subscribers/subscriber.types';

export const subscribersRepository = {
  async list(): Promise<Subscriber[]> {
    const [entries, unsubscribed] = await Promise.all([
      getDb().waitlistEntry.findMany({ include: { vendor: true }, orderBy: { createdAt: 'desc' } }),
      preferencesRepository.unsubscribedEmails(),
    ]);
    return entries.map((entry) => toSubscriber(entry, unsubscribed));
  },

  async update(id: string, data: Prisma.WaitlistEntryUpdateInput): Promise<Subscriber | null> {
    try {
      const entry = await getDb().waitlistEntry.update({ where: { id }, data, include: { vendor: true } });
      const unsubscribed =
        entry.email && (await preferencesRepository.isUnsubscribed(entry.email))
          ? new Set([entry.email.toLowerCase()])
          : new Set<string>();
      return toSubscriber(entry, unsubscribed);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await getDb().waitlistEntry.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  },
};

export type SubscribersRepository = typeof subscribersRepository;
