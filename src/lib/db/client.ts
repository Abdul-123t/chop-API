import { PrismaPg } from '@prisma/adapter-pg';
import { getEnv } from '@/config/env';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { chopPrisma?: PrismaClient };

export function getDb(): PrismaClient {
  if (!globalForPrisma.chopPrisma) {
    const adapter = new PrismaPg({ connectionString: getEnv().DATABASE_URL });
    globalForPrisma.chopPrisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.chopPrisma;
}
