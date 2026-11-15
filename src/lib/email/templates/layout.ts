import { BRAND } from '@/lib/email/templates/brand';
import { escapeHtml } from '@/lib/email/templates/text';

interface LayoutOptions {
  preheader: string;
  body: string;
  unsubscribeUrl?: string;
  footerNote?: string;
}

export function renderLayout({ preheader, body, unsubscribeUrl, footerNote }: LayoutOptions): string {
  const footer = [
    footerNote ? escapeHtml(footerNote) : '',
    unsubscribeUrl ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:${BRAND.muted};">Unsubscribe</a>` : '',
  ]
    .filter(Boolean)
    .join(' &middot; ');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${BRAND.name}</title></head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:${BRAND.font};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 4px 16px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:${BRAND.charcoal};">${BRAND.name}<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${BRAND.orange};margin-left:5px;"></span></td></tr>
<tr><td style="background:#ffffff;border:1px solid ${BRAND.line};border-radius:20px;padding:28px 24px;">${body}</td></tr>
<tr><td style="padding:16px 4px 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">${footer}</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
