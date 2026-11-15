import { applyCors } from '@/lib/http/cors';
import { errorResponse } from '@/lib/http/responses';

type Handler<Context> = (request: Request, context: Context) => Promise<Response>;

function withSecurityHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export function apiRoute<Context = unknown>(handler: Handler<Context>): Handler<Context> {
  return async (request, context) => {
    let response: Response;
    try {
      response = await handler(request, context);
    } catch (error) {
      response = errorResponse(error);
    }
    return applyCors(request, withSecurityHeaders(response));
  };
}

export async function preflight(request: Request): Promise<Response> {
  return applyCors(request, new Response(null, { status: 204 }));
}
