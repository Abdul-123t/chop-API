import { EventEmitter } from 'node:events';
import { Client } from 'pg';
import { getEnv } from '@/config/env';
import { ADMIN_EVENTS_CHANNEL, adminEventSchema, type AdminEvent } from '@/lib/realtime/events';

type Listener = (event: AdminEvent) => void;

const RECONNECT_DELAY_MS = 3000;
const SEEN_LIMIT = 500;

export function parseNotification(payload: string | undefined): AdminEvent | null {
  if (!payload) return null;
  try {
    const parsed = adminEventSchema.safeParse(JSON.parse(payload));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

class RealtimeHub {
  private readonly emitter = new EventEmitter().setMaxListeners(0);
  private client: Client | null = null;
  private connecting: Promise<void> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly seen = new Set<string>();

  emitLocal(event: AdminEvent): void {
    this.remember(event.uid);
    this.emitter.emit('event', event);
  }

  subscribe(listener: Listener): () => void {
    this.emitter.on('event', listener);
    void this.connect();
    return () => {
      this.emitter.off('event', listener);
    };
  }

  private get listenerCount(): number {
    return this.emitter.listenerCount('event');
  }

  private connect(): Promise<void> {
    if (this.client) return Promise.resolve();
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      const client = new Client({ connectionString: getEnv().DATABASE_URL });
      client.on('notification', (message) => {
        const event = parseNotification(message.payload);
        if (event && !this.seen.has(event.uid)) {
          this.remember(event.uid);
          this.emitter.emit('event', event);
        }
      });
      client.on('error', (error) => this.handleDisconnect(client, error));
      client.on('end', () => this.handleDisconnect(client));
      await client.connect();
      await client.query(`LISTEN ${ADMIN_EVENTS_CHANNEL}`);
      this.client = client;
    })()
      .catch((error: unknown) => {
        console.error('[realtime] Listener connection failed.', error instanceof Error ? error.message : error);
        this.scheduleReconnect();
      })
      .finally(() => {
        this.connecting = null;
      });

    return this.connecting;
  }

  private remember(uid: string): void {
    this.seen.add(uid);
    if (this.seen.size > SEEN_LIMIT) {
      const oldest = this.seen.values().next().value;
      if (oldest !== undefined) this.seen.delete(oldest);
    }
  }

  private handleDisconnect(client: Client, error?: Error): void {
    if (error) console.error('[realtime] Listener disconnected.', error.message);
    if (this.client === client) this.client = null;
    client.removeAllListeners();
    void client.end().catch(() => undefined);
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.retryTimer || this.listenerCount === 0) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.listenerCount > 0) void this.connect();
    }, RECONNECT_DELAY_MS);
  }
}

const globalForRealtime = globalThis as unknown as { chopRealtimeHub?: RealtimeHub };

export function getRealtimeHub(): RealtimeHub {
  globalForRealtime.chopRealtimeHub ??= new RealtimeHub();
  return globalForRealtime.chopRealtimeHub;
}
