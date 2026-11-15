import { randomUUID } from 'node:crypto';
import { publishAdminEvent, type PublishAdminEvent } from '@/lib/realtime/publish';
import { parseWith } from '@/lib/validation';
import { notifyNewRegistration } from '@/modules/waitlist/waitlist.notifications';
import { entryId, toCreateInput } from '@/modules/waitlist/waitlist.mapper';
import { waitlistRepository, type WaitlistRepository } from '@/modules/waitlist/waitlist.repository';
import { registrationSchema, type Registration } from '@/modules/waitlist/waitlist.schema';

export interface RegistrationResult {
  id: string;
  duplicate: boolean;
}

interface Dependencies {
  repository: WaitlistRepository;
  notify: (registration: Registration, id: string) => Promise<void>;
  publish: PublishAdminEvent;
  now: () => Date;
}

const defaults: Dependencies = {
  repository: waitlistRepository,
  notify: notifyNewRegistration,
  publish: publishAdminEvent,
  now: () => new Date(),
};

export function createWaitlistService(overrides: Partial<Dependencies> = {}) {
  const { repository, notify, publish, now } = { ...defaults, ...overrides };

  return {
    async register(input: unknown): Promise<RegistrationResult> {
      const registration = parseWith(
        registrationSchema,
        input,
        'Please review your details and contact consent, then try again.'
      );

      const id = entryId(registration.type, randomUUID());
      const created = await repository.createIfNew(toCreateInput(registration, id, now()));
      if (!created) return { id: '', duplicate: true };

      await publish('entry.created', id);
      await notify(registration, id);
      return { id, duplicate: false };
    },
  };
}

export const waitlistService = createWaitlistService();
