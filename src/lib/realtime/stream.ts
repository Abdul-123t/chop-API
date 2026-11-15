import { formatSse } from '@/lib/realtime/events';
import { getRealtimeHub } from '@/lib/realtime/hub';

const HEARTBEAT_MS = 25_000;

export function createAdminEventStream(signal: AbortSignal): Response {
  const encoder = new TextEncoder();
  let cleanup: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const unsubscribe = getRealtimeHub().subscribe((event) => send(formatSse(event)));
      const heartbeat = setInterval(() => send(': ping\n\n'), HEARTBEAT_MS);

      cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };

      signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          return;
        }
      });

      send('retry: 5000\n: connected\n\n');
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
