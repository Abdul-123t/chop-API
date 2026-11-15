import { describe, expect, it } from 'vitest';
import { selectRecipients } from '@/modules/newsletter/newsletter.audience';
import type { Subscriber } from '@/modules/subscribers/subscriber.types';

const make = (overrides: Partial<Subscriber>): Subscriber => ({
  id: 'id',
  type: 'customer',
  name: 'Ada',
  businessName: '',
  email: 'ada@example.com',
  whatsapp: '',
  area: '',
  student: '',
  interests: [],
  status: 'REGISTERED',
  adminNotes: '',
  joinedAt: '',
  reviewedAt: '',
  subscribed: true,
  vendor: null,
  ...overrides,
});

const people = [
  make({ id: 'c1', name: 'Ada Obi', email: 'Ada@example.com' }),
  make({ id: 'c2', email: '' }),
  make({ id: 'c3', email: 'gone@example.com', subscribed: false }),
  make({ id: 'v1', type: 'vendor', name: 'Bola', email: 'bola@example.com' }),
  make({ id: 'v2', type: 'vendor', name: 'Ada', email: 'ada@example.com' }),
];

describe('selectRecipients', () => {
  it('skips missing emails, unsubscribed people and duplicates', () => {
    expect(selectRecipients(people, { kind: 'all' })).toEqual([
      { email: 'ada@example.com', name: 'Ada' },
      { email: 'bola@example.com', name: 'Bola' },
    ]);
  });

  it('filters by type', () => {
    expect(selectRecipients(people, { kind: 'vendors' }).map((recipient) => recipient.email)).toEqual([
      'bola@example.com',
      'ada@example.com',
    ]);
  });

  it('honours selected ids', () => {
    const recipients = selectRecipients(people, { kind: 'selected', ids: ['v1', 'c3'] });
    expect(recipients.map((recipient) => recipient.email)).toEqual(['bola@example.com']);
  });
});
