import type { Prisma } from '@/generated/prisma/client';
import type { Registration } from '@/modules/waitlist/waitlist.schema';

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function phoneKey(value: unknown): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return digits.slice(3);
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  return digits;
}

const orNull = (value: string) => (value.trim() ? value.trim() : null);

export function entryId(type: Registration['type'], uuid: string): string {
  return `${type === 'customer' ? 'CHOP-C' : 'CHOP-V'}-${uuid}`;
}

export function toCreateInput(registration: Registration, id: string, now: Date): Prisma.WaitlistEntryCreateInput {
  const base = {
    id,
    fullName: registration.fullName,
    whatsapp: registration.whatsapp,
    phoneKey: phoneKey(registration.whatsapp),
    email: orNull(registration.email.toLowerCase()),
    area: registration.area,
    consentAt: now,
    createdAt: now,
  };

  if (registration.type === 'customer') {
    return {
      ...base,
      type: 'CUSTOMER',
      status: 'REGISTERED',
      student: orNull(registration.student),
      interests: registration.searches,
    };
  }

  return {
    ...base,
    type: 'VENDOR',
    status: 'PENDING_REVIEW',
    interests: registration.foodCategories,
    vendor: {
      create: {
        businessName: registration.businessName,
        category: registration.category,
        otherCategory: orNull(registration.otherCategory),
        delivers: registration.delivers,
        operatingModel: orNull(registration.operatingModel),
        operatingLocations: registration.operatingLocations,
        address: orNull(registration.address),
        businessDescription: orNull(registration.businessDescription),
        fulfilmentOptions: registration.fulfilmentOptions,
        socialMediaLink: orNull(registration.socialMediaLink),
        additionalComments: orNull(registration.additionalComments),
      },
    },
  };
}
