import type { z } from 'zod';
import { ValidationError } from '@/lib/errors';

export function parseWith<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
  message = 'Please review the highlighted fields and try again.'
): z.output<Schema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      message,
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }
  return result.data;
}
