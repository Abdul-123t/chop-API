import { z } from 'zod';

export const contentSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required.').max(150),
  message: z.string().trim().min(1, 'Message is required.').max(20_000),
});

export const audienceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('all') }),
  z.object({ kind: z.literal('customers') }),
  z.object({ kind: z.literal('vendors') }),
  z.object({
    kind: z.literal('selected'),
    ids: z.array(z.string().trim().min(1).max(80)).min(1, 'Select at least one person.').max(10_000),
  }),
]);

export const sendNewsletterSchema = contentSchema.extend({ audience: audienceSchema });

export const testNewsletterSchema = contentSchema.extend({ to: z.email().max(254) });

export type NewsletterContent = z.output<typeof contentSchema>;
export type Audience = z.output<typeof audienceSchema>;
