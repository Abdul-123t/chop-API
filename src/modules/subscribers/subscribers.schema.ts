import { z } from 'zod';

export const unsubscribeSchema = z.object({
  token: z.string().trim().min(10).max(1000),
});
