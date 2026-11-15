import { apiRoute, preflight } from '@/lib/http/route';
import { createAdminEventStream } from '@/lib/realtime/stream';
import { requireAdmin } from '@/modules/auth/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = apiRoute(async (request) => {
  await requireAdmin(request);
  return createAdminEventStream(request.signal);
});

export const OPTIONS = preflight;
