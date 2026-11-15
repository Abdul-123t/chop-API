import type { RenderedEmail } from '@/lib/email/types';
import { BRAND } from '@/lib/email/templates/brand';
import { renderLayout } from '@/lib/email/templates/layout';
import { personalize, textToHtml } from '@/lib/email/templates/text';

export interface NewsletterInput {
  subject: string;
  message: string;
  name: string;
  unsubscribeUrl?: string;
}

export function newsletterEmail({ subject, message, name, unsubscribeUrl }: NewsletterInput): RenderedEmail {
  const body = personalize(message, name);
  return {
    subject: personalize(subject, name),
    text: unsubscribeUrl ? `${body}\n\nUnsubscribe: ${unsubscribeUrl}` : body,
    html: renderLayout({
      preheader: body.split('\n')[0]?.slice(0, 120) ?? '',
      body: textToHtml(body),
      unsubscribeUrl,
      footerNote: BRAND.audienceNote,
    }),
  };
}
