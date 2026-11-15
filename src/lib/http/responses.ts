import { AppError } from '@/lib/errors';

export function ok<T extends Record<string, unknown>>(data: T, status = 200): Response {
  return Response.json({ success: true, ...data }, { status });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status }
    );
  }
  console.error('[api] Unexpected error.', error instanceof Error ? error.message : error);
  return Response.json(
    {
      success: false,
      code: 'service_unavailable',
      message: 'Service is temporarily unavailable. Please try again shortly.',
    },
    { status: 503 }
  );
}
