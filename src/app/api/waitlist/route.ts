import { readJson } from '@/lib/http/body';
import { getClientIp } from '@/lib/http/clientIp';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { waitlistLimiter } from '@/modules/waitlist/waitlist.limits';
import { waitlistService } from '@/modules/waitlist/waitlist.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = apiRoute(async (request) => {
  waitlistLimiter.enforce(getClientIp(request));
  const result = await waitlistService.register(await readJson(request));
  return ok({ id: result.id, duplicate: result.duplicate });
});

export const OPTIONS = preflight;
