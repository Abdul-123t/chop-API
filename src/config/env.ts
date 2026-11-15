import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalEmail = optionalString.pipe(z.email().optional());

const baseUrl = z.url().transform((value) => value.replace(/\/+$/, ''));

const envSchema = z.object({
  GOOGLE_SPREADSHEET_ID: z.string().trim().min(1),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().min(1),
  APP_SECRET: z.string().trim().min(32),
  ADMIN_EMAIL: z.email().transform((value) => value.toLowerCase()),
  ADMIN_PASSWORD_HASH: z.string().trim().regex(/^scrypt:\d+:\d+:\d+:[\w-]+:[\w-]+$/),
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

export function getAllowedOrigins(env: Env = getEnv()): string[] {
  const configured = splitList(env.ALLOWED_ORIGINS);
  return configured.length > 0 ? configured : [env.FRONTEND_URL];
}
