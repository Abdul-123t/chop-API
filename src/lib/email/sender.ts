import { emailList, getEnv } from '@/config/env';
import { ServiceUnavailableError } from '@/lib/errors';
import { createBrevoSender } from '@/lib/email/brevo';
import type { EmailSender } from '@/lib/email/types';

let sender: EmailSender | null | undefined;

export function getEmailSender(): EmailSender | null {
  if (sender !== undefined) return sender;
  const env = getEnv();
  sender =
    env.BREVO_API_KEY && env.EMAIL_FROM_ADDRESS
      ? createBrevoSender({
          apiKey: env.BREVO_API_KEY,
          sender: { email: env.EMAIL_FROM_ADDRESS, name: env.EMAIL_FROM_NAME },
          replyTo: env.EMAIL_REPLY_TO ? { email: env.EMAIL_REPLY_TO, name: env.EMAIL_FROM_NAME } : undefined,
        })
      : null;
  return sender;
}

export function requireEmailSender(): EmailSender {
  const configured = getEmailSender();
  if (!configured) throw new ServiceUnavailableError('Email sending is not configured on the server.');
  return configured;
}

export function getAdminRecipients(): string[] {
  return emailList(getEnv().ADMIN_NOTIFY_EMAIL);
}
