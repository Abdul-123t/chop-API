import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z.object({
  GOOGLE_SPREADSHEET_ID: z.string().trim().min(1),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().min(1),
  APP_SECRET: z.string().trim().min(32),
  ADMIN_PASSWORD: z.string().min(12),
  FRONTEND_URL: z.url().transform((value) => value.replace(/\/+$/, '')),
  PUBLIC_API_URL: z.url().transform((value) => value.replace(/\/+$/, '')),
  ADMIN_PATH: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9/_-]*$/)
    .default('/admin'),
  ALLOWED_ORIGINS: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  EMAIL_REPLY_TO: optionalString,
  ADMIN_NOTIFY_EMAIL: optionalString,
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid server environment: ${missing}`);
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
