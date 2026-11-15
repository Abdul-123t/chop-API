import type { Prisma } from '@/generated/prisma/client';
import { getDb } from '@/lib/db/client';
import { isUniqueViolation } from '@/lib/db/errors';

export const waitlistRepository = {
  async createIfNew(data: Prisma.WaitlistEntryCreateInput): Promise<boolean> {
    try {
      await getDb().waitlistEntry.create({ data });
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) return false;
      throw error;
    }
  },
};

export type WaitlistRepository = typeof waitlistRepository;
