import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalEmail = optionalString.pipe(z.email().optional());

const baseUrl = z.url().transform((value) => value.replace(/\/+$/, ''));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const envSchema = z.object({
  DATABASE_URL: z.string().trim().regex(/^postgres(ql)?:\/\//, 'Must be a PostgreSQL connection string.'),
  APP_SECRET: z.string().trim().min(32),
  FRONTEND_URL: baseUrl,
  PUBLIC_API_URL: baseUrl,
  ADMIN_PATH: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9/_-]*$/)
    .default('/admin'),
  ALLOWED_ORIGINS: optionalString,
  BREVO_API_KEY: optionalString,
  EMAIL_FROM_ADDRESS: optionalEmail,
  EMAIL_FROM_NAME: z.string().trim().min(1).default('CHOP'),
  EMAIL_REPLY_TO: optionalEmail,
  ADMIN_NOTIFY_EMAIL: optionalString,
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const invalid = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid server environment: ${invalid}`);
  }
  cached = parsed.data;
  return cached;
}

export function splitList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function emailList(value: string | undefined): string[] {
  return splitList(value).filter((item) => EMAIL_PATTERN.test(item));
}

export function getAllowedOrigins(env: Env = getEnv()): string[] {
  const configured = splitList(env.ALLOWED_ORIGINS);
  return configured.length > 0 ? configured : [env.FRONTEND_URL];
}
