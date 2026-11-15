import { getDb } from '@/lib/db/client';
import { ADMIN_EVENTS_CHANNEL, createEvent, type AdminEventType } from '@/lib/realtime/events';
import { getRealtimeHub } from '@/lib/realtime/hub';

export async function publishAdminEvent(type: AdminEventType, id?: string): Promise<void> {
  const event = createEvent(type, id);
  try {
    getRealtimeHub().emitLocal(event);
    const payload = JSON.stringify(event);
    await getDb().$executeRaw`SELECT pg_notify(${ADMIN_EVENTS_CHANNEL}, ${payload})`;
  } catch (error) {
    console.error('[realtime] Could not publish event.', error instanceof Error ? error.message : error);
  }
}

export type PublishAdminEvent = typeof publishAdminEvent;
