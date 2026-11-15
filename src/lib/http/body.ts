import { PayloadTooLargeError, ValidationError } from '@/lib/errors';

export const DEFAULT_MAX_BODY_BYTES = 16_384;

async function readText(request: Request, maxBytes: number): Promise<string> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > maxBytes) throw new PayloadTooLargeError();
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new PayloadTooLargeError();
  return text;
}

export async function readJson(request: Request, maxBytes = DEFAULT_MAX_BODY_BYTES): Promise<unknown> {
  const text = await readText(request, maxBytes);
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError('Request body must be valid JSON.');
  }
}

export async function readOptionalJson(request: Request, maxBytes = DEFAULT_MAX_BODY_BYTES): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;
  return readJson(request, maxBytes);
}
