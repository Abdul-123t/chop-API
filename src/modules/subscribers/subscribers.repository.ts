import { normalizeEmail } from '@/lib/security/unsubscribeToken';
import { readRows } from '@/lib/sheets/table';
import { CUSTOMER_TAB, VENDOR_TAB } from '@/lib/sheets/tabs';
import { preferencesRepository } from '@/modules/subscribers/preferences.repository';
import { customerFromRow, vendorFromRow } from '@/modules/subscribers/subscriber.mapper';
import type { Subscriber } from '@/modules/subscribers/subscriber.types';

export const subscribersRepository = {
  async list(): Promise<Subscriber[]> {
    const [customerRows, vendorRows, unsubscribed] = await Promise.all([
      readRows(CUSTOMER_TAB),
      readRows(VENDOR_TAB),
      preferencesRepository.unsubscribedEmails(),
    ]);

    const base = [
      ...customerRows.map(customerFromRow),
      ...vendorRows.map(vendorFromRow),
    ].filter((subscriber) => subscriber !== null);

    return base.map((subscriber) => ({
      ...subscriber,
      subscribed: !subscriber.email || !unsubscribed.has(normalizeEmail(subscriber.email)),
    }));
  },
};

export type SubscribersRepository = typeof subscribersRepository;
