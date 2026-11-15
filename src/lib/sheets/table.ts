import type { sheets_v4 } from '@googleapis/sheets';
import { getSheetsClient, getSpreadsheetId } from '@/lib/sheets/client';
import { columnLetter, tabRange, type TabDefinition } from '@/lib/sheets/tabs';

const ensured = new Set<string>();

async function listTitles(api: sheets_v4.Sheets, spreadsheetId: string): Promise<Set<string>> {
  const metadata = await api.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
  return new Set(metadata.data.sheets?.map((sheet) => sheet.properties?.title ?? '') ?? []);
}

export async function ensureTab(tab: TabDefinition): Promise<void> {
  if (ensured.has(tab.title)) return;
  const api = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  if (!(await listTitles(api, spreadsheetId)).has(tab.title)) {
    try {
      await api.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: tab.title } } }] },
      });
    } catch (error) {
      if (!(await listTitles(api, spreadsheetId)).has(tab.title)) throw error;
    }
  }

  const current = await api.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tab.title}'!A1:${columnLetter(tab.headers.length)}1`,
  });
  const headers = current.data.values?.[0] ?? [];

  if (headers.length === 0 || headers.every((value) => value === '')) {
    await api.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tab.title}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [[...tab.headers]] },
    });
  } else if (tab.headers.some((header, index) => headers[index] !== header)) {
    throw new Error(`The "${tab.title}" sheet headers do not match the required columns.`);
  }

  ensured.add(tab.title);
}

export async function readRows(tab: TabDefinition): Promise<unknown[][]> {
  await ensureTab(tab);
  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: tabRange(tab, 2),
  });
  return (response.data.values ?? []) as unknown[][];
}

export async function readColumn(tab: TabDefinition, column: string): Promise<unknown[]> {
  await ensureTab(tab);
  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `'${tab.title}'!${column}2:${column}`,
  });
  return (response.data.values ?? []).map((row) => row[0]);
}

export async function appendRows(tab: TabDefinition, rows: string[][]): Promise<void> {
  if (rows.length === 0) return;
  await ensureTab(tab);
  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: tabRange(tab),
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}
