import { getEnv } from '@/config/env';
import { createUnsubscribeToken } from '@/lib/security/unsubscribeToken';

export interface UnsubscribeLinks {
  page: string;
  oneClick: string;
}

export function unsubscribeLinks(email: string): UnsubscribeLinks {
  const env = getEnv();
  const token = encodeURIComponent(createUnsubscribeToken(email, env.APP_SECRET));
  return {
    page: `${env.FRONTEND_URL}/unsubscribe?token=${token}`,
    oneClick: `${env.PUBLIC_API_URL}/api/unsubscribe?token=${token}`,
  };
}

export function unsubscribeHeaders(links: UnsubscribeLinks): Record<string, string> {
  return {
    'List-Unsubscribe': `<${links.oneClick}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

export function adminUrl(): string {
  const env = getEnv();
  return `${env.FRONTEND_URL}${env.ADMIN_PATH}`;
}
