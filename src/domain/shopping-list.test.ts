import { describe, expect, it } from '@jest/globals';

import {
  calculateShoppingListItemActualMinor,
  calculateShoppingListItemPlannedMinor,
  calculateShoppingListTotals,
  markShoppingListItemPurchased,
  markShoppingListItemUnpurchased,
  validateShoppingList,
  validateShoppingListItem,
  type ShoppingList,
  type ShoppingListItem,
} from './shopping-list';

function createItem(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    actualUnitMinor: null,
    createdAt: '2026-07-31T00:00:00.000Z',
    deletedAt: null,
    id: 'item-1',
    listId: 'list-1',
    name: 'Milk',
    plannedUnitMinor: 600,
    purchasedAt: null,
    quantityMilli: 2000,
    sortOrder: 1,
    unitCode: 'piece',
    updatedAt: '2026-07-31T00:00:00.000Z',
    ...overrides,
  };
}

function createShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
  const milk = createItem({ actualUnitMinor: 650, purchasedAt: '2026-07-31T00:00:00.000Z' });
  const rice = createItem({
    actualUnitMinor: null,
    id: 'item-2',
    name: 'Rice',
    plannedUnitMinor: 2500,
    quantityMilli: 1000,
    sortOrder: 2,
  });

  return {
    budgetMinor: 4000,
    createdAt: '2026-07-31T00:00:00.000Z',
    currencyCode: 'BRL',
    deletedAt: null,
    finalizedAt: null,
    id: 'list-1',
    items: [milk, rice],
    name: 'Weekly groceries',
    status: 'draft',
    updatedAt: '2026-07-31T00:00:00.000Z',
    ...overrides,
  };
}

describe('shopping list domain', () => {
  it('calculates planned and actual totals using integer math only', () => {
    const list = createShoppingList();

    expect(calculateShoppingListItemPlannedMinor(list.items[0])).toBe(1200);
    expect(calculateShoppingListItemActualMinor(list.items[0])).toBe(1300);
    expect(calculateShoppingListTotals(list)).toEqual({
      actualMinor: 1300,
      plannedMinor: 3700,
      remainingMinor: 2700,
      varianceMinor: -2400,
    });
  });

  it('rounds kilogram totals without floats', () => {
    const item = createItem({
      id: 'item-kg',
      listId: 'list-kg',
      name: 'Potatoes',
      plannedUnitMinor: 200,
      quantityMilli: 1500,
      unitCode: 'kg',
    });

    expect(calculateShoppingListItemPlannedMinor(item)).toBe(300);
  });

  it('rejects invalid whole-unit precision and purchased items without actual price', () => {
    const invalidWholeUnit = createItem({ quantityMilli: 1500, unitCode: 'piece' });
    const purchasedWithoutActualPrice = createItem({ actualUnitMinor: null, purchasedAt: '2026-07-31T00:00:00.000Z' });

    expect(validateShoppingListItem(invalidWholeUnit).success).toBe(false);
    expect(validateShoppingListItem(purchasedWithoutActualPrice).success).toBe(false);
  });

  it('rejects unsafe integer money and quantity values at validation and calculation boundaries', () => {
    const unsafeInteger = Number.MAX_SAFE_INTEGER + 1;

    expect(validateShoppingList(createShoppingList({ budgetMinor: unsafeInteger })).success).toBe(false);
    expect(validateShoppingListItem(createItem({ quantityMilli: unsafeInteger })).success).toBe(false);
    expect(() => calculateShoppingListItemPlannedMinor(createItem({ quantityMilli: unsafeInteger }))).toThrow(
      'safe integers'
    );
  });

  it('rejects invalid closed enums and negative money values', () => {
    const validation = validateShoppingList(
      createShoppingList({
        budgetMinor: -1,
        currencyCode: 'EUR' as never,
        status: 'paused' as never,
      })
    );

    expect(validation.success).toBe(false);
  });

  it('retains actual price when an item is marked unpurchased', () => {
    const list = createShoppingList();
    const purchased = markShoppingListItemPurchased(list, 'item-2', 2500, '2026-07-31T00:00:00.000Z');
    const unpurchased = markShoppingListItemUnpurchased(purchased, 'item-2', '2026-07-31T00:00:01.000Z');

    expect(unpurchased.items[1]).toMatchObject({
      actualUnitMinor: 2500,
      purchasedAt: null,
    });
    expect(calculateShoppingListTotals(unpurchased)).toEqual({
      actualMinor: 1300,
      plannedMinor: 3700,
      remainingMinor: 2700,
      varianceMinor: -2400,
    });
  });

  it('rejects mutations on soft-deleted lists and items', () => {
    const deletedList = createShoppingList({
      deletedAt: '2026-07-31T00:00:00.000Z',
    });
    const deletedItemList = createShoppingList({
      items: [
        createItem({
          deletedAt: '2026-07-31T00:00:00.000Z',
        }),
      ],
    });

    expect(() => markShoppingListItemPurchased(deletedList, 'item-1', 650, '2026-07-31T10:00:00.000Z')).toThrow(
      'Cannot mutate a deleted shopping list.'
    );
    expect(() => markShoppingListItemUnpurchased(deletedItemList, 'item-1', '2026-07-31T10:00:00.000Z')).toThrow(
      'Cannot mutate a deleted shopping list item.'
    );
  });

  it('ignores deleted items when calculating totals', () => {
    const list = createShoppingList({
      items: [
        createItem({ actualUnitMinor: 650, purchasedAt: '2026-07-31T00:00:00.000Z' }),
        createItem({
          deletedAt: '2026-07-31T00:00:00.000Z',
          id: 'item-2',
          actualUnitMinor: 900,
          purchasedAt: '2026-07-31T00:00:00.000Z',
        }),
      ],
    });

    expect(calculateShoppingListTotals(list)).toEqual({
      actualMinor: 1300,
      plannedMinor: 1200,
      remainingMinor: 2700,
      varianceMinor: 100,
    });
  });

  it('validates shopping list names and linked items', () => {
    const list = createShoppingList({
      items: [
        createItem({ listId: 'other-list', name: '   ' }),
      ],
      name: '   ',
    });

    const validation = validateShoppingList(list);

    expect(validation.success).toBe(false);
    expect(validation).toMatchObject({
      success: false,
    });
  });
});
