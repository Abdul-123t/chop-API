import { getAllowedOrigins } from '@/config/env';

const ALLOWED_METHODS = 'GET, POST, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';

export function resolveAllowedOrigin(origin: string | null, allowed: string[]): string | null {
  if (!origin) return null;
  return allowed.includes(origin) ? origin : null;
}

export function applyCors(request: Request, response: Response, allowed = safeAllowedOrigins()): Response {
  const origin = resolveAllowedOrigin(request.headers.get('origin'), allowed);
  response.headers.append('Vary', 'Origin');
  if (!origin) return response;
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  response.headers.set('Access-Control-Max-Age', '600');
  return response;
}

function safeAllowedOrigins(): string[] {
  try {
    return getAllowedOrigins();
  } catch {
    return [];
  }
}
