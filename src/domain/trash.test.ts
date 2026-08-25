import { describe, expect, it } from '@jest/globals';

import { getShoppingListTrashCutoff, isShoppingListTrashExpired, markShoppingListDeleted, markShoppingListRestored } from './shopping-list';

const list = {
  budgetMinor: 100,
  createdAt: '2026-08-01T00:00:00.000Z',
  currencyCode: 'BRL' as const,
  deletedAt: null,
  finalizedAt: null,
  id: 'list-1',
  items: [],
  name: 'List',
  status: 'draft' as const,
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('trash retention', () => {
  it('expires exactly at seven days and restores before the boundary', () => {
    const deleted = markShoppingListDeleted(list, '2026-08-01T00:00:00.000Z');
    expect(isShoppingListTrashExpired(deleted.deletedAt!, '2026-08-07T23:59:59.999Z')).toBe(false);
    expect(isShoppingListTrashExpired(deleted.deletedAt!, '2026-08-08T00:00:00.000Z')).toBe(true);
    expect(markShoppingListRestored(deleted, '2026-08-02T00:00:00.000Z').deletedAt).toBeNull();
  });

  it('uses one ISO cutoff for cleanup and expiry checks', () => {
    const now = '2026-08-13T12:34:56.789Z';
    const cutoff = getShoppingListTrashCutoff(now);

    expect(cutoff).toBe('2026-08-06T12:34:56.789Z');
    expect(isShoppingListTrashExpired(cutoff, now)).toBe(true);
    expect(isShoppingListTrashExpired('2026-08-06T12:34:56.790Z', now)).toBe(false);
  });
});
