import { readOptionalJson } from '@/lib/http/body';
import { ok } from '@/lib/http/responses';
import { apiRoute, preflight } from '@/lib/http/route';
import { subscribersService } from '@/modules/subscribers/subscribers.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = apiRoute(async (request) => {
  const queryToken = new URL(request.url).searchParams.get('token');
  const input = queryToken ? { token: queryToken } : await readOptionalJson(request);
  await subscribersService.unsubscribe(input, queryToken ? 'one-click' : 'unsubscribe-page');
  return ok({ unsubscribed: true });
});

export const OPTIONS = preflight;
