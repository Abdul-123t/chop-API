import { appendRows, readColumn } from '@/lib/sheets/table';
import { CUSTOMER_TAB, VENDOR_TAB } from '@/lib/sheets/tabs';
import { phoneKey } from '@/modules/waitlist/waitlist.mapper';
import type { Registration } from '@/modules/waitlist/waitlist.schema';

const PHONE_COLUMN = { customer: 'D', vendor: 'E' } as const;

function tabFor(type: Registration['type']) {
  return type === 'customer' ? CUSTOMER_TAB : VENDOR_TAB;
}

export const waitlistRepository = {
  async phoneExists(type: Registration['type'], whatsapp: string): Promise<boolean> {
    const key = phoneKey(whatsapp);
    const phones = await readColumn(tabFor(type), PHONE_COLUMN[type]);
    return phones.some((value) => phoneKey(value) === key);
  },

  async append(type: Registration['type'], row: string[]): Promise<void> {
    await appendRows(tabFor(type), [row]);
  },
};

export type WaitlistRepository = typeof waitlistRepository;
