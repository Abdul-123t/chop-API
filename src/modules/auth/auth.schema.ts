import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(1, 'Password is required.').max(200),
});

export const sessionPayloadSchema = z.object({
  sub: z.literal('admin'),
  exp: z.number().int().positive(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
