import { UnauthorizedError } from '@/lib/errors';
import { authService } from '@/modules/auth/auth.service';
import type { AdminSession } from '@/modules/auth/auth.schema';

export function bearerToken(request: Request): string {
  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token.trim() : '';
}

export async function requireAdmin(request: Request): Promise<AdminSession> {
  const session = await authService.verify(bearerToken(request));
  if (!session) throw new UnauthorizedError();
  return session;
}
