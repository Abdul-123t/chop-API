const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const FORMULA_PREFIX = /^\s*[=+\-@]/;

export function toCell(value: string): string {
  const cleaned = value.replace(CONTROL_CHARACTERS, '');
  return FORMULA_PREFIX.test(cleaned) ? `'${cleaned}` : cleaned;
}

export function fromCell(value: unknown): string {
  const text = value === undefined || value === null ? '' : String(value);
  return text.startsWith("'") && FORMULA_PREFIX.test(text.slice(1)) ? text.slice(1) : text;
}

export function splitList(value: unknown): string[] {
  return fromCell(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
