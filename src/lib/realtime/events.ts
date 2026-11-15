import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const ADMIN_EVENTS_CHANNEL = 'chop_admin_events';

export const adminEventSchema = z.object({
  uid: z.string().min(1),
  type: z.enum(['entry.created', 'entry.updated', 'entry.deleted', 'preferences.updated', 'newsletter.sent']),
  id: z.string().optional(),
  at: z.string(),
});

export type AdminEvent = z.infer<typeof adminEventSchema>;

export type AdminEventType = AdminEvent['type'];

export function createEvent(type: AdminEventType, id?: string): AdminEvent {
  return { uid: randomUUID(), type, ...(id ? { id } : {}), at: new Date().toISOString() };
}

export function formatSse(event: AdminEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}
