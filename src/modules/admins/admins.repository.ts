import { getDb } from '@/lib/db/client';

export interface AdminRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
}

export const adminsRepository = {
  findByEmail(email: string): Promise<AdminRecord | null> {
    return getDb().adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
  },

  findById(id: string): Promise<Omit<AdminRecord, 'passwordHash'> | null> {
    return getDb().adminUser.findUnique({ where: { id }, select: { id: true, email: true, name: true } });
  },

  async recordLogin(id: string): Promise<void> {
    await getDb().adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },
};
