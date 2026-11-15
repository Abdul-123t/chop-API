import { readJson } from '@/lib/http/body';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { requireAdmin } from '@/modules/auth/requireAdmin';
import { newsletterService } from '@/modules/newsletter/newsletter.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = apiRoute(async (request) => {
  await requireAdmin(request);
  const result = await newsletterService.sendTest(await readJson(request, 64 * 1024));
  return ok(result);
});

export const OPTIONS = preflight;
