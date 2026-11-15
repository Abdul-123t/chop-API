import type { EmailMessage, RenderedEmail } from '@/lib/email/types';
import { newsletterEmail } from '@/lib/email/templates/newsletter';
import { unsubscribeHeaders, unsubscribeLinks } from '@/lib/links';
import type { Recipient } from '@/modules/newsletter/newsletter.audience';
import type { NewsletterContent } from '@/modules/newsletter/newsletter.schema';

export const PREVIEW_NAME = 'Ada';

export function renderPreview(content: NewsletterContent): RenderedEmail {
  return newsletterEmail({ ...content, name: PREVIEW_NAME, unsubscribeUrl: '#unsubscribe' });
}

export function composeMessage(content: NewsletterContent, recipient: Recipient): EmailMessage {
  const links = unsubscribeLinks(recipient.email);
  return {
    to: [recipient.email],
    headers: unsubscribeHeaders(links),
    ...newsletterEmail({ ...content, name: recipient.name, unsubscribeUrl: links.page }),
  };
}
