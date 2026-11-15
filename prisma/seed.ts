import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { generatePassword, hashPassword } from '../src/lib/security/password.ts';

config({ path: ['.env.local', '.env'], quiet: true });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function seedEmails(): { valid: string[]; skipped: string[] } {
  const entries = (process.env.SEED_ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return {
    valid: entries.filter((value) => EMAIL_PATTERN.test(value)),
    skipped: entries.filter((value) => !EMAIL_PATTERN.test(value)),
  };
}

function resetTarget(): string | null {
  const index = process.argv.indexOf('--reset');
  return index >= 0 ? (process.argv[index + 1]?.trim().toLowerCase() ?? null) : null;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set.');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const reset = resetTarget();
    const { valid, skipped } = seedEmails();
    const targets = reset ? [reset] : valid;

    if (targets.length === 0) {
      console.log('No admin emails to seed. Set SEED_ADMIN_EMAILS or pass --reset <email>.');
      return;
    }

    for (const email of targets) {
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing && !reset) {
        console.log(`exists   ${email}`);
        continue;
      }
      const chosen = process.env.SEED_ADMIN_PASSWORD?.trim();
      const password = chosen || generatePassword();
      await prisma.adminUser.upsert({
        where: { email },
        create: { email, passwordHash: hashPassword(password) },
        update: { passwordHash: hashPassword(password) },
      });
      console.log(`${existing ? 'reset  ' : 'created'}  ${email}  password: ${chosen ? '(SEED_ADMIN_PASSWORD)' : password}`);
    }

    for (const value of skipped) console.log(`skipped  ${value} (not an email address yet)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
