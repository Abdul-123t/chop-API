import type { RenderedEmail } from '@/lib/email/types';
import { BRAND } from '@/lib/email/templates/brand';
import { renderLayout } from '@/lib/email/templates/layout';
import { escapeHtml, heading } from '@/lib/email/templates/text';

export interface AdminSignupInput {
  title: string;
  rows: ReadonlyArray<readonly [string, string]>;
  adminUrl?: string;
}

export function adminSignupEmail({ title, rows, adminUrl }: AdminSignupInput): RenderedEmail {
  const filled = rows.filter(([, value]) => value.trim() !== '');
  const table = filled
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:${BRAND.muted};vertical-align:top;white-space:nowrap;">${escapeHtml(
          label
        )}</td><td style="padding:6px 0;font-size:14px;color:${BRAND.charcoal};font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join('');
  const button = adminUrl
    ? `<p style="margin:20px 0 0;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:${BRAND.orange};color:${BRAND.charcoal};font-weight:700;font-size:14px;text-decoration:none;padding:10px 18px;border-radius:999px;">Open admin</a></p>`
    : '';

  return {
    subject: `[CHOP] ${title}`,
    text: [title, ...filled.map(([label, value]) => `${label}: ${value}`), adminUrl ?? ''].filter(Boolean).join('\n'),
    html: renderLayout({
      preheader: title,
      body: `${heading(title)}<table role="presentation" cellpadding="0" cellspacing="0">${table}</table>${button}`,
    }),
  };
}
