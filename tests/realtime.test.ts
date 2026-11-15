import { describe, expect, it } from 'vitest';
import { createEvent, formatSse } from '@/lib/realtime/events';
import { parseNotification } from '@/lib/realtime/hub';

describe('realtime events', () => {
  it('formats server-sent events', () => {
    const event = createEvent('entry.created', 'CHOP-C-1');
    expect(formatSse(event)).toBe(`event: entry.created\ndata: ${JSON.stringify(event)}\n\n`);
  });

  it('parses only valid notifications', () => {
    const event = createEvent('newsletter.sent', 'NL-1');
    expect(parseNotification(JSON.stringify(event))).toEqual(event);
    expect(parseNotification('{"uid":"u","type":"unknown","at":"x"}')).toBeNull();
    expect(parseNotification('not json')).toBeNull();
    expect(parseNotification(undefined)).toBeNull();
  });
});

describe('realtime hub', () => {
  it('delivers local events once even if the database echoes them back', async () => {
    const { getRealtimeHub } = await import('@/lib/realtime/hub');
    const hub = getRealtimeHub();
    const received: string[] = [];
    const unsubscribe = hub.subscribe((event) => received.push(event.uid));
    const event = createEvent('entry.updated', 'CHOP-C-1');
    hub.emitLocal(event);
    expect(received).toEqual([event.uid]);
    unsubscribe();
  });
});
