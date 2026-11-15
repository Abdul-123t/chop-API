import { z } from 'zod';
import {
  AREA_OPTIONS,
  CUSTOMER_CRAVINGS,
  DELIVERY_OPTIONS,
  FOOD_CATEGORIES,
  FULFILMENT_OPTIONS,
  OPERATING_MODELS,
  STUDENT_OPTIONS,
} from '@/config/catalog';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+0-9().\-\s]{8,24}$/;

const text = (max: number) => z.string().trim().max(max).default('');

const uniqueList = <T extends string>(item: z.ZodType<T>, max: number) =>
  z
    .array(item)
    .max(max)
    .default([])
    .transform((values) => [...new Set(values)]);

const optionalOf = <T extends readonly [string, ...string[]]>(options: T) =>
  z.union([z.enum(options), z.literal('')]).default('');

const whatsapp = z
  .string()
  .trim()
  .regex(PHONE_PATTERN, 'Enter a valid WhatsApp number.')
  .refine((value) => {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 8 && digits <= 15;
  }, 'Enter a valid WhatsApp number.');

const email = z
  .string()
  .trim()
  .max(254)
  .default('')
  .refine((value) => value === '' || EMAIL_PATTERN.test(value), 'Enter a valid email address.');

const socialLink = z
  .string()
  .trim()
  .max(500)
  .default('')
  .refine((value) => {
    if (!value) return true;
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Enter a valid link.');

const shared = {
  fullName: z.string().trim().min(2).max(120),
  whatsapp,
  email,
  area: z.enum(AREA_OPTIONS),
  contactConsent: z.literal(true, 'Contact consent is required.'),
  website: z.union([z.literal(''), z.null(), z.undefined()]),
};

export const customerRegistrationSchema = z.object({
  type: z.literal('customer'),
  ...shared,
  student: optionalOf(STUDENT_OPTIONS),
  searches: uniqueList(z.enum(CUSTOMER_CRAVINGS), CUSTOMER_CRAVINGS.length),
});

type Fulfilment = (typeof FULFILMENT_OPTIONS)[number];

const fulfilmentFor: Record<(typeof DELIVERY_OPTIONS)[number], readonly Fulfilment[]> = {
  No: ['Pickup'],
  Sometimes: ['Pickup', 'Delivery'],
  Yes: ['Delivery'],
};

export const vendorRegistrationSchema = z
  .object({
    type: z.literal('vendor'),
    ...shared,
    businessName: z.string().trim().min(1).max(160),
    category: z.enum(FOOD_CATEGORIES),
    delivers: z.enum(DELIVERY_OPTIONS),
    address: text(500),
    operatingModel: optionalOf(OPERATING_MODELS),
    operatingLocations: uniqueList(z.enum(AREA_OPTIONS), AREA_OPTIONS.length),
    businessDescription: text(2000),
    otherCategory: text(100),
    foodCategories: uniqueList(z.enum(FOOD_CATEGORIES), FOOD_CATEGORIES.length),
    fulfilmentOptions: uniqueList(z.enum(FULFILMENT_OPTIONS), FULFILMENT_OPTIONS.length),
    socialMediaLink: socialLink,
    additionalComments: text(2000),
  })
  .superRefine((value, context) => {
    if (!value.foodCategories.includes(value.category)) {
      context.addIssue({
        code: 'custom',
        path: ['foodCategories'],
        message: 'Food categories must include the business category.',
      });
    }
    const expected = fulfilmentFor[value.delivers];
    const actual = value.fulfilmentOptions;
    if (expected.length !== actual.length || expected.some((option) => !actual.includes(option))) {
      context.addIssue({
        code: 'custom',
        path: ['fulfilmentOptions'],
        message: 'Fulfilment options do not match the delivery choice.',
      });
    }
  })
  .transform((value) => ({
    ...value,
    operatingLocations: value.operatingLocations.length > 0 ? value.operatingLocations : [value.area],
  }));

export const registrationSchema = z.discriminatedUnion('type', [
  customerRegistrationSchema,
  vendorRegistrationSchema,
]);

export type CustomerRegistration = z.output<typeof customerRegistrationSchema>;
export type VendorRegistration = z.output<typeof vendorRegistrationSchema>;
export type Registration = z.output<typeof registrationSchema>;
