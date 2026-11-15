import { toCell } from '@/lib/sheets/cells';
import type { CustomerRegistration, Registration, VendorRegistration } from '@/modules/waitlist/waitlist.schema';

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function customerRow(registration: CustomerRegistration, id: string, timestamp: string): string[] {
  return [
    id,
    timestamp,
    toCell(firstName(registration.fullName)),
    registration.whatsapp,
    toCell(registration.email),
    toCell(registration.area),
    toCell(registration.searches.join(', ')),
    'Yes',
    timestamp,
    'Registered',
  ];
}

export function vendorRow(registration: VendorRegistration, id: string, timestamp: string): string[] {
  return [
    id,
    timestamp,
    toCell(registration.businessName),
    toCell(registration.fullName),
    registration.whatsapp,
    toCell(registration.email),
    toCell(registration.category),
    toCell(registration.otherCategory),
    toCell(registration.operatingModel),
    toCell(registration.operatingLocations.join(', ')),
    toCell(registration.businessDescription),
    toCell(registration.foodCategories.join(', ')),
    toCell(registration.fulfilmentOptions.join(', ')),
    toCell(registration.socialMediaLink),
    toCell(registration.additionalComments),
    'Yes',
    'Pending review',
    '',
    '',
  ];
}

export function registrationRow(registration: Registration, id: string, timestamp: string): string[] {
  return registration.type === 'customer'
    ? customerRow(registration, id, timestamp)
    : vendorRow(registration, id, timestamp);
}

export function phoneKey(value: unknown): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return digits.slice(3);
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  return digits;
}
