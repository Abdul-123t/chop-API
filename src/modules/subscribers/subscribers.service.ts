import { getEnv } from '@/config/env';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { publishAdminEvent } from '@/lib/realtime/publish';
import { readUnsubscribeToken } from '@/lib/security/unsubscribeToken';
import { parseWith } from '@/lib/validation';
import { preferencesRepository } from '@/modules/subscribers/preferences.repository';
import {
  subscriberIdSchema,
  unsubscribeSchema,
  updateSubscriberSchema,
} from '@/modules/subscribers/subscribers.schema';
import { subscribersRepository } from '@/modules/subscribers/subscribers.repository';
import { computeStats } from '@/modules/subscribers/subscribers.stats';

export const subscribersService = {
  async overview() {
    const subscribers = await subscribersRepository.list();
    return { subscribers, stats: computeStats(subscribers) };
  },

  async update(rawId: string, input: unknown) {
    const id = parseWith(subscriberIdSchema, rawId);
    const { status, adminNotes } = parseWith(updateSubscriberSchema, input);
    const subscriber = await subscribersRepository.update(id, {
      ...(status ? { status, reviewedAt: new Date() } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes || null } : {}),
    });
    if (!subscriber) throw new NotFoundError();
    await publishAdminEvent('entry.updated', id);
    return subscriber;
  },

  async remove(rawId: string) {
    const id = parseWith(subscriberIdSchema, rawId);
    if (!(await subscribersRepository.remove(id))) throw new NotFoundError();
    await publishAdminEvent('entry.deleted', id);
  },

  async unsubscribe(input: unknown, source: string): Promise<string> {
    const { token } = parseWith(unsubscribeSchema, input, 'This unsubscribe link is invalid.');
    const email = readUnsubscribeToken(token, getEnv().APP_SECRET);
    if (!email) throw new ValidationError('This unsubscribe link is invalid.');
    await preferencesRepository.unsubscribe(email, source);
    await publishAdminEvent('preferences.updated');
    return email;
  },
};
