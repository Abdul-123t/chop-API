import { describe, expect, it } from 'vitest';
import { toSubscriber, type EntryWithVendor } from '@/modules/subscribers/subscriber.mapper';
import { updateSubscriberSchema } from '@/modules/subscribers/subscribers.schema';
import { computeStats } from '@/modules/subscribers/subscribers.stats';

const base: EntryWithVendor = {
  id: 'CHOP-C-1',
  type: 'CUSTOMER',
  fullName: 'Ada Obi',
  whatsapp: '08012345678',
  phoneKey: '8012345678',
  email: 'Ada@example.com',
  area: 'Ijebu Ode',
  student: null,
  interests: ['Lunch'],
  status: 'REGISTERED',
  adminNotes: null,
  source: 'website',
  consentAt: new Date('2026-11-15T10:00:00Z'),
  reviewedAt: null,
  createdAt: new Date('2026-11-15T10:00:00Z'),
  updatedAt: new Date('2026-11-15T10:00:00Z'),
  vendor: null,
};

const vendorEntry: EntryWithVendor = {
  ...base,
  id: 'CHOP-V-1',
  type: 'VENDOR',
  email: null,
  status: 'PENDING_REVIEW',
  vendor: {
    entryId: 'CHOP-V-1',
    businessName: 'Bola Kitchen',
    category: 'Local Bukas',
    otherCategory: null,
    delivers: 'Yes',
    operatingModel: null,
    operatingLocations: ['Ijagun (TASUED)'],
    address: null,
    businessDescription: null,
    fulfilmentOptions: ['Delivery'],
    socialMediaLink: null,
    additionalComments: null,
  },
};

describe('toSubscriber', () => {
  it('marks unsubscribed emails case-insensitively', () => {
    const subscriber = toSubscriber(base, new Set(['ada@example.com']));
    expect(subscriber).toMatchObject({ type: 'customer', subscribed: false, joinedAt: '2026-11-15T10:00:00.000Z' });
  });

  it('flattens vendor profiles', () => {
    const subscriber = toSubscriber(vendorEntry, new Set());
    expect(subscriber).toMatchObject({
      type: 'vendor',
      businessName: 'Bola Kitchen',
      area: 'Ijagun (TASUED)',
      email: '',
      subscribed: true,
    });
    expect(subscriber.vendor?.address).toBe('');
  });

  it('computes stats', () => {
    const stats = computeStats([toSubscriber(base, new Set(['ada@example.com'])), toSubscriber(vendorEntry, new Set())]);
    expect(stats).toEqual({ total: 2, customers: 1, vendors: 1, withEmail: 1, unsubscribed: 1, reachable: 0 });
  });
});

describe('updateSubscriberSchema', () => {
  it('requires at least one field', () => {
    expect(updateSubscriberSchema.safeParse({}).success).toBe(false);
    expect(updateSubscriberSchema.safeParse({ status: 'APPROVED' }).success).toBe(true);
    expect(updateSubscriberSchema.safeParse({ status: 'DELETED' }).success).toBe(false);
  });
});
