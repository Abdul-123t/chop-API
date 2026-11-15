import { BRAND } from '@/lib/email/templates/brand';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linkify(escaped: string): string {
  return escaped.replace(
    /https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g,
    (url) => `<a href="${url}" style="color:${BRAND.orange};font-weight:700;">${url}</a>`
  );
}

export function textToHtml(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.charcoal};">${linkify(
          escapeHtml(paragraph)
        ).replace(/\n/g, '<br>')}</p>`
    )
    .join('');
}

export function personalize(text: string, name: string): string {
  return text.replace(/\{\{\s*name\s*\}\}/gi, name.trim() || 'there');
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;font-weight:800;color:${BRAND.charcoal};">${escapeHtml(
    text
  )}</h1>`;
}
