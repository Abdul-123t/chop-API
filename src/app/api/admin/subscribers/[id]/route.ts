import { readJson } from '@/lib/http/body';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { requireAdmin } from '@/modules/auth/requireAdmin';
import { subscribersService } from '@/modules/subscribers/subscribers.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export const PATCH = apiRoute<Context>(async (request, { params }) => {
  await requireAdmin(request);
  const { id } = await params;
  const subscriber = await subscribersService.update(id, await readJson(request));
  return ok({ subscriber: { ...subscriber } });
});

export const DELETE = apiRoute<Context>(async (request, { params }) => {
  await requireAdmin(request);
  const { id } = await params;
  await subscribersService.remove(id);
  return ok({ deleted: true });
});

export const OPTIONS = preflight;
