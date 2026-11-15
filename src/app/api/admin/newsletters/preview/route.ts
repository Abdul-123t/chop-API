import { readJson } from '@/lib/http/body';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { requireAdmin } from '@/modules/auth/requireAdmin';
import { newsletterService } from '@/modules/newsletter/newsletter.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = apiRoute(async (request) => {
  requireAdmin(request);
  const preview = newsletterService.preview(await readJson(request, 64 * 1024));
  return ok({ ...preview });
});

export const OPTIONS = preflight;
