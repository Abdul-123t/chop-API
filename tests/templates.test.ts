import { describe, expect, it } from 'vitest';
import { newsletterEmail } from '@/lib/email/templates/newsletter';
import { textToHtml } from '@/lib/email/templates/text';
import { welcomeEmail } from '@/lib/email/templates/welcome';

describe('email templates', () => {
  it('escapes html and links urls', () => {
    const html = textToHtml('<b>hi</b>\n\nVisit https://chopijebu.com.');
    expect(html).toContain('&lt;b&gt;hi&lt;/b&gt;');
    expect(html).toContain('<a href="https://chopijebu.com"');
  });

  it('personalizes newsletters and includes the unsubscribe link', () => {
    const email = newsletterEmail({
      subject: 'Hey {{name}}',
      message: 'Hello {{ name }}, we launch soon.',
      name: 'Ada',
      unsubscribeUrl: 'https://chopijebu.com/unsubscribe?token=abc',
    });
    expect(email.subject).toBe('Hey Ada');
    expect(email.text).toContain('Hello Ada, we launch soon.');
    expect(email.html).toContain('unsubscribe?token=abc');
  });

  it('writes a vendor-specific welcome', () => {
    const email = welcomeEmail({ firstName: 'Bola', type: 'vendor', businessName: 'Bola Kitchen' });
    expect(email.subject).toContain('vendor application');
    expect(email.text).toContain('Bola Kitchen');
  });
});
