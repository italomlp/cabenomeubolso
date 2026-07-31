import { describe, expect, it, jest } from '@jest/globals';

import { createShoppingListUseCases } from './shopping-list-use-cases';
import type { ShoppingList } from './shopping-list';
import type { ShoppingListRepository } from './shopping-list-repository';

function createShoppingList(): ShoppingList {
  return {
    budgetMinor: 4000,
    createdAt: '2026-07-31T00:00:00.000Z',
    currencyCode: 'BRL',
    deletedAt: null,
    finalizedAt: null,
    id: 'list-1',
    items: [
      {
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
      },
    ],
    name: 'Weekly groceries',
    status: 'draft',
    updatedAt: '2026-07-31T00:00:00.000Z',
  };
}

describe('createShoppingListUseCases', () => {
  it('sets actual price explicitly when purchasing and preserves it on unpurchase', async () => {
    const list = createShoppingList();
    const repository: ShoppingListRepository = {
      get: jest.fn(async () => list),
      list: jest.fn(async () => [list]),
      save: jest.fn(async () => undefined),
    };
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    const purchased = await useCases.setItemPurchased('list-1', 'item-1', 650);
    const unpurchased = await useCases.setItemUnpurchased('list-1', 'item-1');

    expect(purchased.items[0]).toMatchObject({
      actualUnitMinor: 650,
      purchasedAt: '2026-07-31T10:00:00.000Z',
    });
    expect(unpurchased.items[0]).toMatchObject({
      actualUnitMinor: null,
      purchasedAt: null,
    });
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('refuses to mutate deleted lists or deleted items', async () => {
    const deletedList = createShoppingList();
    const deletedItemList = createShoppingList();
    deletedList.deletedAt = '2026-07-31T00:00:00.000Z';
    deletedItemList.items = [
      {
        ...deletedItemList.items[0],
        deletedAt: '2026-07-31T00:00:00.000Z',
      },
    ];

    const repository: ShoppingListRepository = {
      get: jest.fn(async (id) => (id === 'deleted-item-list' ? deletedItemList : deletedList)),
      list: jest.fn(async () => [deletedList, deletedItemList]),
      save: jest.fn(async () => undefined),
    };
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    await expect(useCases.setItemPurchased('deleted-list', 'item-1', 650)).rejects.toThrow(
      'Cannot mutate a deleted shopping list.'
    );
    await expect(useCases.setItemUnpurchased('deleted-item-list', 'item-1')).rejects.toThrow(
      'Cannot mutate a deleted shopping list item.'
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
