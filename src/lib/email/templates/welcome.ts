import type { RenderedEmail } from '@/lib/email/types';
import { BRAND } from '@/lib/email/templates/brand';
import { renderLayout } from '@/lib/email/templates/layout';
import { heading, textToHtml } from '@/lib/email/templates/text';

export interface WelcomeInput {
  firstName: string;
  type: 'customer' | 'vendor';
  businessName?: string;
  unsubscribeUrl?: string;
}

function lines({ firstName, type, businessName }: WelcomeInput): string[] {
  const name = firstName.trim() || 'there';
  if (type === 'vendor') {
    return [
      `Hi ${name},`,
      `Thanks for applying to list ${businessName?.trim() || 'your business'} on CHOP. We have your details and our team will review your application.`,
      'We will reach out on WhatsApp or email before launch with next steps.',
      'The CHOP team',
    ];
  }
  return [
    `Hi ${name},`,
    "You're on the CHOP waitlist. We're bringing every food spot in Ijebu Ode and Ijagun (TASUED) into one place.",
    "We'll let you know as soon as we launch.",
    'The CHOP team',
  ];
}

export function welcomeEmail(input: WelcomeInput): RenderedEmail {
  const subject =
    input.type === 'vendor' ? 'We got your CHOP vendor application' : "You're on the CHOP waitlist";
  const content = lines(input);
  const text = content.join('\n\n');
  return {
    subject,
    text: input.unsubscribeUrl ? `${text}\n\nUnsubscribe: ${input.unsubscribeUrl}` : text,
    html: renderLayout({
      preheader: content[1] ?? subject,
      body: heading(subject) + textToHtml(text),
      unsubscribeUrl: input.unsubscribeUrl,
      footerNote: BRAND.audienceNote,
    }),
  };
}
