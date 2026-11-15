import { readJson } from '@/lib/http/body';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { requireAdmin } from '@/modules/auth/requireAdmin';
import { newsletterService } from '@/modules/newsletter/newsletter.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_SEND_BYTES = 512 * 1024;

export const GET = apiRoute(async (request) => {
  requireAdmin(request);
  return ok({ newsletters: await newsletterService.history() });
});

export const POST = apiRoute(async (request) => {
  requireAdmin(request);
  const newsletter = await newsletterService.send(await readJson(request, MAX_SEND_BYTES));
  return ok({ newsletter: { ...newsletter } });
});

export const OPTIONS = preflight;
