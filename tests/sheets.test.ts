import { describe, expect, it } from 'vitest';
import { fromCell, toCell } from '@/lib/sheets/cells';
import { columnLetter } from '@/lib/sheets/tabs';
import { latestStatuses } from '@/modules/subscribers/preferences.repository';
import { vendorFromRow } from '@/modules/subscribers/subscriber.mapper';

describe('sheet helpers', () => {
  it('round-trips escaped formulas', () => {
    expect(fromCell(toCell('=SUM(A1)'))).toBe('=SUM(A1)');
    expect(fromCell("'normal")).toBe("'normal");
  });

  it('computes column letters', () => {
    expect(columnLetter(1)).toBe('A');
    expect(columnLetter(19)).toBe('S');
    expect(columnLetter(28)).toBe('AB');
  });

  it('keeps the latest preference per email', () => {
    const statuses = latestStatuses([
      ['Ada@example.com', 'unsubscribed'],
      ['ada@example.com', 'subscribed'],
      ['bola@example.com', 'unsubscribed'],
    ]);
    expect(statuses.get('ada@example.com')).toBe('subscribed');
    expect(statuses.get('bola@example.com')).toBe('unsubscribed');
  });

  it('maps vendor rows', () => {
    const row = [
      'CHOP-V-1',
      '2026-11-15T10:00:00.000Z',
      'Bola Kitchen',
      'Bola Vendor',
      '08012345678',
      'bola@example.com',
      'Local Bukas',
      '',
      '',
      'Ijebu Ode',
      '',
      'Local Bukas',
      '',
      '',
      '',
      'Yes',
      'Pending review',
    ];
    expect(vendorFromRow(row)).toMatchObject({
      businessName: 'Bola Kitchen',
      name: 'Bola Vendor',
      status: 'Pending review',
    });
  });
});
