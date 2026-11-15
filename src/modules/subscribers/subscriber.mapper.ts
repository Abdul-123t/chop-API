import type { VendorProfile, WaitlistEntry } from '@/generated/prisma/client';
import type { Subscriber, VendorDetails } from '@/modules/subscribers/subscriber.types';

export type EntryWithVendor = WaitlistEntry & { vendor: VendorProfile | null };

function vendorDetails(vendor: VendorProfile): VendorDetails {
  return {
    category: vendor.category,
    otherCategory: vendor.otherCategory ?? '',
    delivers: vendor.delivers,
    operatingModel: vendor.operatingModel ?? '',
    operatingLocations: vendor.operatingLocations,
    address: vendor.address ?? '',
    businessDescription: vendor.businessDescription ?? '',
    fulfilmentOptions: vendor.fulfilmentOptions,
    socialMediaLink: vendor.socialMediaLink ?? '',
    additionalComments: vendor.additionalComments ?? '',
  };
}

export function toSubscriber(entry: EntryWithVendor, unsubscribed: ReadonlySet<string>): Subscriber {
  const email = entry.email ?? '';
  return {
    id: entry.id,
    type: entry.type === 'VENDOR' ? 'vendor' : 'customer',
    name: entry.fullName,
    businessName: entry.vendor?.businessName ?? '',
    email,
    whatsapp: entry.whatsapp,
    area: entry.vendor ? entry.vendor.operatingLocations.join(', ') || entry.area : entry.area,
    student: entry.student ?? '',
    interests: entry.interests,
    status: entry.status,
    adminNotes: entry.adminNotes ?? '',
    joinedAt: entry.createdAt.toISOString(),
    reviewedAt: entry.reviewedAt?.toISOString() ?? '',
    subscribed: !email || !unsubscribed.has(email.toLowerCase()),
    vendor: entry.vendor ? vendorDetails(entry.vendor) : null,
  };
}
