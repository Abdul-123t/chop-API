import { describe, expect, it } from 'vitest';
import { CUSTOMER_TAB, VENDOR_TAB } from '@/lib/sheets/tabs';
import { phoneKey, registrationRow } from '@/modules/waitlist/waitlist.mapper';
import { registrationSchema } from '@/modules/waitlist/waitlist.schema';
import { customerBody, vendorBody } from './fixtures/registrations';

const timestamp = '2026-11-15T10:00:00.000Z';

describe('registrationRow', () => {
  it('maps customers to the customer columns', () => {
    const row = registrationRow(registrationSchema.parse(customerBody), 'CHOP-C-1', timestamp);
    expect(row).toHaveLength(CUSTOMER_TAB.headers.length);
    expect(row.slice(0, 7)).toEqual([
      'CHOP-C-1',
      timestamp,
      'Ada',
      '08012345678',
      'ada@example.com',
      'Ijebu Ode',
      'Breakfast, Dinner',
    ]);
  });

  it('maps vendors and escapes formula-like text', () => {
    const row = registrationRow(registrationSchema.parse(vendorBody), 'CHOP-V-1', timestamp);
    expect(row).toHaveLength(VENDOR_TAB.headers.length);
    expect(row[2]).toBe('Bola Kitchen');
    expect(row[14]).toBe(`'=HYPERLINK("x")`);
    expect(row[16]).toBe('Pending review');
  });
});

describe('phoneKey', () => {
  it('treats local and international Nigerian formats as the same number', () => {
    expect(phoneKey('08012345678')).toBe(phoneKey('+234 801 234 5678'));
  });
});
