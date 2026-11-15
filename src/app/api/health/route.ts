import { apiRoute, preflight } from '@/lib/http/route';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

export const GET = apiRoute(async () => ok({ status: 'ok', time: new Date().toISOString() }));

export const OPTIONS = preflight;
