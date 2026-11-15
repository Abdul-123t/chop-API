import { getEnv } from '@/config/env';
import { ValidationError } from '@/lib/errors';
import { readUnsubscribeToken } from '@/lib/security/unsubscribeToken';
import { parseWith } from '@/lib/validation';
import { unsubscribeSchema } from '@/modules/subscribers/subscribers.schema';
import { preferencesRepository } from '@/modules/subscribers/preferences.repository';
import { subscribersRepository } from '@/modules/subscribers/subscribers.repository';
import { computeStats } from '@/modules/subscribers/subscribers.stats';

export const subscribersService = {
  async overview() {
    const subscribers = (await subscribersRepository.list()).sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
    return { subscribers, stats: computeStats(subscribers) };
  },

  async unsubscribe(input: unknown, source: string): Promise<string> {
    const { token } = parseWith(unsubscribeSchema, input, 'This unsubscribe link is invalid.');
    const email = readUnsubscribeToken(token, getEnv().APP_SECRET);
    if (!email) throw new ValidationError('This unsubscribe link is invalid.');
    await preferencesRepository.record(email, 'unsubscribed', source);
    return email;
  },
};
