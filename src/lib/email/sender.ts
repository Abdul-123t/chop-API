import { getEnv, splitList } from '@/config/env';
import { ServiceUnavailableError } from '@/lib/errors';
import { createResendSender } from '@/lib/email/resend';
import type { EmailSender } from '@/lib/email/types';

let sender: EmailSender | null | undefined;

export function getEmailSender(): EmailSender | null {
  if (sender !== undefined) return sender;
  const env = getEnv();
  sender =
    env.RESEND_API_KEY && env.EMAIL_FROM
      ? createResendSender({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM, replyTo: env.EMAIL_REPLY_TO })
      : null;
  return sender;
}

export function requireEmailSender(): EmailSender {
  const configured = getEmailSender();
  if (!configured) throw new ServiceUnavailableError('Email sending is not configured on the server.');
  return configured;
}

export function getAdminRecipients(): string[] {
  return splitList(getEnv().ADMIN_NOTIFY_EMAIL);
}
