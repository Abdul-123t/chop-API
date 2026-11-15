import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { requireAdmin } from '@/modules/auth/requireAdmin';
import { subscribersService } from '@/modules/subscribers/subscribers.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = apiRoute(async (request) => {
  requireAdmin(request);
  const overview = await subscribersService.overview();
  return ok({ ...overview });
});

export const OPTIONS = preflight;
