import { normalizeEmail } from '@/lib/security/unsubscribeToken';
import { isReachable } from '@/modules/subscribers/subscribers.stats';
import type { Subscriber } from '@/modules/subscribers/subscriber.types';
import type { Audience } from '@/modules/newsletter/newsletter.schema';

export interface Recipient {
  email: string;
  name: string;
}

function matches(subscriber: Subscriber, audience: Audience, selected: Set<string>): boolean {
  switch (audience.kind) {
    case 'all':
      return true;
    case 'customers':
      return subscriber.type === 'customer';
    case 'vendors':
      return subscriber.type === 'vendor';
    case 'selected':
      return selected.has(subscriber.id);
  }
}

export function selectRecipients(subscribers: Subscriber[], audience: Audience): Recipient[] {
  const selected = new Set(audience.kind === 'selected' ? audience.ids : []);
  const byEmail = new Map<string, Recipient>();
  for (const subscriber of subscribers) {
    if (!isReachable(subscriber) || !matches(subscriber, audience, selected)) continue;
    const email = normalizeEmail(subscriber.email);
    if (!byEmail.has(email)) byEmail.set(email, { email, name: subscriber.name.split(/\s+/)[0] ?? '' });
  }
  return [...byEmail.values()];
}

export function describeAudience(audience: Audience): string {
  return audience.kind === 'selected' ? `selected (${audience.ids.length})` : audience.kind;
}
