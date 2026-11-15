import { applyCors } from '@/lib/http/cors';
import { errorResponse } from '@/lib/http/responses';

type Handler = (request: Request) => Promise<Response>;

function withSecurityHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export function apiRoute(handler: Handler): Handler {
  return async (request) => {
    let response: Response;
    try {
      response = await handler(request);
    } catch (error) {
      response = errorResponse(error);
    }
    return applyCors(request, withSecurityHeaders(response));
  };
}

export async function preflight(request: Request): Promise<Response> {
  return applyCors(request, new Response(null, { status: 204 }));
}
