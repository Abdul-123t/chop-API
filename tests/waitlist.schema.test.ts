import { describe, expect, it } from 'vitest';
import { registrationSchema } from '@/modules/waitlist/waitlist.schema';
import { customerBody, vendorBody } from './fixtures/registrations';

describe('registrationSchema', () => {
  it('accepts a customer and removes duplicate cravings', () => {
    const result = registrationSchema.parse(customerBody);
    expect(result.type).toBe('customer');
    if (result.type === 'customer') expect(result.searches).toEqual(['Breakfast', 'Dinner']);
  });

  it('accepts a vendor and defaults operating locations to the area', () => {
    const result = registrationSchema.parse(vendorBody);
    expect(result.type).toBe('vendor');
    if (result.type === 'vendor') expect(result.operatingLocations).toEqual(['Ijagun (TASUED)']);
  });

  it('rejects missing consent', () => {
    expect(registrationSchema.safeParse({ ...customerBody, contactConsent: false }).success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    expect(registrationSchema.safeParse({ ...customerBody, website: 'spam' }).success).toBe(false);
  });

  it('rejects invalid phone and email', () => {
    expect(registrationSchema.safeParse({ ...customerBody, whatsapp: '12' }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...customerBody, email: 'nope' }).success).toBe(false);
  });

  it('rejects fulfilment that does not match the delivery choice', () => {
    expect(registrationSchema.safeParse({ ...vendorBody, fulfilmentOptions: ['Pickup'] }).success).toBe(false);
  });

  it('rejects vendor food categories missing the business category', () => {
    expect(registrationSchema.safeParse({ ...vendorBody, foodCategories: ['Bakeries'] }).success).toBe(false);
  });

  it('rejects non-http social links', () => {
    expect(
      registrationSchema.safeParse({ ...vendorBody, socialMediaLink: 'javascript:alert(1)' }).success
    ).toBe(false);
  });
});
