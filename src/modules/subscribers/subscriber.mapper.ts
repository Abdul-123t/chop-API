import { fromCell, splitList } from '@/lib/sheets/cells';
import type { Subscriber } from '@/modules/subscribers/subscriber.types';

type Row = unknown[];

const cell = (row: Row, index: number) => fromCell(row[index]).trim();

export function customerFromRow(row: Row): Omit<Subscriber, 'subscribed'> | null {
  const id = cell(row, 0);
  if (!id) return null;
  return {
    id,
    type: 'customer',
    joinedAt: cell(row, 1),
    name: cell(row, 2),
    businessName: '',
    whatsapp: cell(row, 3),
    email: cell(row, 4),
    area: cell(row, 5),
    interests: splitList(row[6]),
    status: cell(row, 9),
  };
}

export function vendorFromRow(row: Row): Omit<Subscriber, 'subscribed'> | null {
  const id = cell(row, 0);
  if (!id) return null;
  return {
    id,
    type: 'vendor',
    joinedAt: cell(row, 1),
    businessName: cell(row, 2),
    name: cell(row, 3),
    whatsapp: cell(row, 4),
    email: cell(row, 5),
    area: splitList(row[9]).join(', '),
    interests: splitList(row[11]),
    status: cell(row, 16),
  };
}
