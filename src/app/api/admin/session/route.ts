import { readJson } from '@/lib/http/body';
import { getClientIp } from '@/lib/http/clientIp';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { authService } from '@/modules/auth/auth.service';
import { requireAdmin } from '@/modules/auth/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = apiRoute(async (request) => {
  const session = await authService.login(await readJson(request), getClientIp(request));
  return ok(session);
});

export const GET = apiRoute(async (request) => {
  const session = await requireAdmin(request);
  return ok({ authenticated: true, email: session.email, name: session.name, expiresAt: session.expiresAt });
});

export const OPTIONS = preflight;
