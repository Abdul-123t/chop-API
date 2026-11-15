import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.').max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required.').max(200),
});

export const sessionPayloadSchema = z.object({
  sub: z.string().min(1),
  exp: z.number().int().positive(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  expiresAt: number;
}
