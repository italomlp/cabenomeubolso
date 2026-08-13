import { describe, expect, it } from '@jest/globals';

import { createRecurrenceTemplateFromList, generateShoppingListFromTemplate } from './recurrence-template';
import type { ShoppingList } from './shopping-list';

const list: ShoppingList = {
  budgetMinor: 4000,
  createdAt: '2026-08-01T00:00:00.000Z',
  currencyCode: 'BRL',
  deletedAt: null,
  finalizedAt: null,
  id: 'list-1',
  items: [{
    actualUnitMinor: 650,
    createdAt: '2026-08-01T00:00:00.000Z',
    deletedAt: null,
    id: 'item-1',
    listId: 'list-1',
    name: ' Milk ',
    plannedUnitMinor: 600,
    purchasedAt: '2026-08-01T00:00:00.000Z',
    quantityMilli: 2000,
    sortOrder: 1,
    unitCode: 'piece',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }],
  name: 'Weekly groceries',
  status: 'draft',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('recurrence template snapshots', () => {
  it('copies only planning data and preserves currency, unit, and quantity', () => {
    let sequence = 0;
    const createId = (prefix: string) => `${prefix}-${++sequence}`;
    const template = createRecurrenceTemplateFromList(list, '2026-08-02T00:00:00.000Z', createId);
    const generated = generateShoppingListFromTemplate(template, '2026-08-03T00:00:00.000Z', createId);

    expect(template.items[0]).toMatchObject({ plannedUnitMinor: 600, quantityMilli: 2000, unitCode: 'piece' });
    expect(generated).toMatchObject({ currencyCode: 'BRL', id: 'shopping-list-3', status: 'draft' });
    expect(generated.items[0]).toMatchObject({ actualUnitMinor: null, purchasedAt: null, quantityMilli: 2000, unitCode: 'piece' });
    expect(generated.items[0].id).not.toBe(list.items[0].id);
  });

  it('does not link later template edits to a generated occurrence', () => {
    let sequence = 0;
    const createId = (prefix: string) => `${prefix}-${++sequence}`;
    const template = createRecurrenceTemplateFromList(list, '2026-08-02T00:00:00.000Z', createId);
    const generated = generateShoppingListFromTemplate(template, '2026-08-03T00:00:00.000Z', createId);
    template.items[0].name = 'Changed template item';

    expect(generated.items[0].name).toBe('Milk');
  });
});
