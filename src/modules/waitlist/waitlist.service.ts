import { randomUUID } from 'node:crypto';
import { parseWith } from '@/lib/validation';
import { notifyNewRegistration } from '@/modules/waitlist/waitlist.notifications';
import { registrationRow } from '@/modules/waitlist/waitlist.mapper';
import { waitlistRepository, type WaitlistRepository } from '@/modules/waitlist/waitlist.repository';
import { registrationSchema, type Registration } from '@/modules/waitlist/waitlist.schema';

export interface RegistrationResult {
  id: string;
  duplicate: boolean;
}

interface Dependencies {
  repository: WaitlistRepository;
  notify: (registration: Registration, id: string) => Promise<void>;
  now: () => Date;
}

const defaults: Dependencies = {
  repository: waitlistRepository,
  notify: notifyNewRegistration,
  now: () => new Date(),
};

export function createWaitlistService(overrides: Partial<Dependencies> = {}) {
  const { repository, notify, now } = { ...defaults, ...overrides };

  return {
    async register(input: unknown): Promise<RegistrationResult> {
      const registration = parseWith(
        registrationSchema,
        input,
        'Please review your details and contact consent, then try again.'
      );

      if (await repository.phoneExists(registration.type, registration.whatsapp)) {
        return { id: '', duplicate: true };
      }

      const id = `${registration.type === 'customer' ? 'CHOP-C' : 'CHOP-V'}-${randomUUID()}`;
      await repository.append(registration.type, registrationRow(registration, id, now().toISOString()));
      await notify(registration, id);
      return { id, duplicate: false };
    },
  };
}

export const waitlistService = createWaitlistService();
