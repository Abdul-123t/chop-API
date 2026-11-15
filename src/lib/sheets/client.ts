import { auth, sheets, type sheets_v4 } from '@googleapis/sheets';
import { z } from 'zod';
import { getEnv } from '@/config/env';
import { ServiceUnavailableError } from '@/lib/errors';

const credentialsSchema = z.object({
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});

let client: sheets_v4.Sheets | undefined;

export function getSheetsClient(): sheets_v4.Sheets {
  if (client) return client;
  let raw: unknown;
  try {
    raw = JSON.parse(getEnv().GOOGLE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new ServiceUnavailableError('Google Sheets credentials are invalid.');
  }
  const credentials = credentialsSchema.safeParse(raw);
  if (!credentials.success) throw new ServiceUnavailableError('Google Sheets credentials are invalid.');

  const googleAuth = new auth.GoogleAuth({
    credentials: credentials.data,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  client = sheets({ version: 'v4', auth: googleAuth });
  return client;
}

export function getSpreadsheetId(): string {
  return getEnv().GOOGLE_SPREADSHEET_ID;
}
