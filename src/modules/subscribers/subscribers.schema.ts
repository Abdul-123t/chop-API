import { z } from 'zod';

export const unsubscribeSchema = z.object({
  token: z.string().trim().min(10).max(1000),
});

export const subscriberIdSchema = z.string().trim().regex(/^CHOP-[CV]-[0-9a-f-]{36}$/, 'Unknown entry.');

export const updateSubscriberSchema = z
  .object({
    status: z.enum(['REGISTERED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED']).optional(),
    adminNotes: z.string().trim().max(5000).optional(),
  })
  .refine((value) => value.status !== undefined || value.adminNotes !== undefined, 'Nothing to update.');

export type UpdateSubscriberInput = z.output<typeof updateSubscriberSchema>;
