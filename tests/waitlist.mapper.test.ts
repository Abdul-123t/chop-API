import { describe, expect, it } from 'vitest';
import { entryId, phoneKey, toCreateInput } from '@/modules/waitlist/waitlist.mapper';
import { registrationSchema } from '@/modules/waitlist/waitlist.schema';
import { customerBody, vendorBody } from './fixtures/registrations';

const now = new Date('2026-11-15T10:00:00.000Z');

describe('toCreateInput', () => {
  it('maps customers without a vendor profile', () => {
    const input = toCreateInput(registrationSchema.parse(customerBody), 'CHOP-C-1', now);
    expect(input).toMatchObject({
      id: 'CHOP-C-1',
      type: 'CUSTOMER',
      status: 'REGISTERED',
      fullName: 'Ada Customer',
      phoneKey: '8012345678',
      email: 'ada@example.com',
      student: 'Yes, at TASUED',
      interests: ['Breakfast', 'Dinner'],
      consentAt: now,
    });
    expect(input.vendor).toBeUndefined();
  });

  it('maps vendors with a nested profile and nulls for blanks', () => {
    const input = toCreateInput(registrationSchema.parse(vendorBody), 'CHOP-V-1', now);
    expect(input).toMatchObject({ type: 'VENDOR', status: 'PENDING_REVIEW', email: null });
    expect(input.vendor?.create).toMatchObject({
      businessName: 'Bola Kitchen',
      category: 'Local Bukas',
      otherCategory: null,
      operatingLocations: ['Ijagun (TASUED)'],
      fulfilmentOptions: ['Pickup', 'Delivery'],
      additionalComments: '=HYPERLINK("x")',
    });
  });
});

describe('ids and phone keys', () => {
  it('prefixes ids by type', () => {
    expect(entryId('customer', 'abc')).toBe('CHOP-C-abc');
    expect(entryId('vendor', 'abc')).toBe('CHOP-V-abc');
  });

  it('treats local and international Nigerian formats as the same number', () => {
    expect(phoneKey('08012345678')).toBe(phoneKey('+234 801 234 5678'));
  });
});
