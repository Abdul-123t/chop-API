import type { Subscriber, SubscriberStats } from '@/modules/subscribers/subscriber.types';

export function isReachable(subscriber: Subscriber): boolean {
  return Boolean(subscriber.email) && subscriber.subscribed;
}

export function computeStats(subscribers: Subscriber[]): SubscriberStats {
  return {
    total: subscribers.length,
    customers: subscribers.filter((subscriber) => subscriber.type === 'customer').length,
    vendors: subscribers.filter((subscriber) => subscriber.type === 'vendor').length,
    withEmail: subscribers.filter((subscriber) => subscriber.email).length,
    unsubscribed: subscribers.filter((subscriber) => subscriber.email && !subscriber.subscribed).length,
    reachable: subscribers.filter(isReachable).length,
  };
}
