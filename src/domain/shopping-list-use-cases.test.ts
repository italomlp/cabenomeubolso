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

function createCompraSemanalList(): ShoppingList {
  return {
    budgetMinor: 12_345,
    createdAt: '2026-07-31T00:00:00.000Z',
    currencyCode: 'BRL',
    deletedAt: null,
    finalizedAt: null,
    id: 'list-compra-semanal',
    items: [
      {
        actualUnitMinor: null,
        createdAt: '2026-07-31T00:00:00.000Z',
        deletedAt: null,
        id: 'item-1',
        listId: 'list-compra-semanal',
        name: 'Eggs',
        plannedUnitMinor: 350,
        purchasedAt: null,
        quantityMilli: 2000,
        sortOrder: 1,
        unitCode: 'piece',
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
      {
        actualUnitMinor: null,
        createdAt: '2026-07-31T00:00:00.000Z',
        deletedAt: null,
        id: 'item-2',
        listId: 'list-compra-semanal',
        name: 'Rice',
        plannedUnitMinor: 1000,
        purchasedAt: null,
        quantityMilli: 500000,
        sortOrder: 2,
        unitCode: 'g',
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
      {
        actualUnitMinor: null,
        createdAt: '2026-07-31T00:00:00.000Z',
        deletedAt: null,
        id: 'item-3',
        listId: 'list-compra-semanal',
        name: 'Potatoes',
        plannedUnitMinor: 200,
        purchasedAt: null,
        quantityMilli: 1500,
        sortOrder: 3,
        unitCode: 'kg',
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
    ],
    name: 'Compra semanal',
    status: 'draft',
    updatedAt: '2026-07-31T00:00:00.000Z',
  };
}

function createRepository(initialList: ShoppingList): ShoppingListRepository {
  let currentList = JSON.parse(JSON.stringify(initialList)) as ShoppingList;

  return {
    get: jest.fn(async (id) => (id === currentList.id ? JSON.parse(JSON.stringify(currentList)) : null)),
    list: jest.fn(async () => [JSON.parse(JSON.stringify(currentList))]),
    save: jest.fn(async (list) => {
      currentList = JSON.parse(JSON.stringify(list)) as ShoppingList;
    }),
  };
}

describe('createShoppingListUseCases', () => {
  it('sets actual price explicitly when purchasing and retains it on unpurchase', async () => {
    const list = createShoppingList();
    const repository = createRepository(list);
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
      actualUnitMinor: 650,
      purchasedAt: null,
    });
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('reuses the retained actual price when purchasing again after unpurchase', async () => {
    const repository = createRepository(createShoppingList());
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    await useCases.setItemPurchased('list-1', 'item-1', 650);
    await useCases.setItemUnpurchased('list-1', 'item-1');

    const repurchased = await useCases.setItemPurchased('list-1', 'item-1');

    expect(repurchased.items[0]).toMatchObject({
      actualUnitMinor: 650,
      purchasedAt: '2026-07-31T10:00:00.000Z',
    });
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

  it('refuses to save an empty list', async () => {
    const list = createShoppingList();
    list.items = [];

    const repository: ShoppingListRepository = {
      get: jest.fn(async () => list),
      list: jest.fn(async () => [list]),
      save: jest.fn(async () => undefined),
    };
    const useCases = createShoppingListUseCases({
      repository,
    });

    await expect(useCases.saveList(list)).rejects.toThrow('items: At least one non-deleted item is required.');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('reopens finalized lists and preserves exact planned values through repository round-trips', async () => {
    const repository = createRepository(createCompraSemanalList());
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    const finalized = await useCases.finalizeList('list-compra-semanal', { confirmUnpurchased: true });
    const reopened = await useCases.reopenList('list-compra-semanal');
    const reloaded = await useCases.loadList('list-compra-semanal');

    expect(finalized).toMatchObject({
      finalizedAt: '2026-07-31T10:00:00.000Z',
      status: 'finalized',
    });
    expect(reopened).toMatchObject({
      finalizedAt: null,
      status: 'draft',
    });
    expect(reloaded).toMatchObject({
      finalizedAt: null,
      items: [
        { quantityMilli: 2000, unitCode: 'piece' },
        { quantityMilli: 500000, unitCode: 'g' },
        { quantityMilli: 1500, unitCode: 'kg' },
      ],
      name: 'Compra semanal',
      status: 'draft',
    });
    await expect(useCases.saveList(finalized)).rejects.toThrow(
      'Finalized shopping lists must be reopened before editing.'
    );
  });

  it('requires explicit confirmation before finalizing with unpurchased items', async () => {
    const repository = createRepository(createShoppingList());
    const useCases = createShoppingListUseCases({ repository });

    await expect(useCases.finalizeList('list-1', { confirmUnpurchased: false })).rejects.toThrow(
      'Confirmation is required to finalize with unpurchased items.'
    );
    await expect(useCases.finalizeList('list-1', { confirmUnpurchased: true })).resolves.toMatchObject({
      status: 'finalized',
    });
  });

  it('clones a list with new independent identities and no purchase state', async () => {
    const source = createShoppingList();
    const repository = createRepository(source);
    let sequence = 0;
    const useCases = createShoppingListUseCases({
      createId: (prefix) => `${prefix}-${++sequence}`,
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    const cloned = await useCases.cloneList('list-1', 'Next groceries');

    expect(cloned).toMatchObject({
      currencyCode: source.currencyCode,
      id: 'shopping-list-1',
      name: 'Next groceries',
      status: 'draft',
    });
    expect(cloned.items).toHaveLength(1);
    expect(cloned.items[0]).toMatchObject({
      actualUnitMinor: null,
      id: 'shopping-list-1-item-2',
      listId: 'shopping-list-1',
      purchasedAt: null,
    });
    expect(cloned.items[0].id).not.toBe(source.items[0].id);
  });

  it('soft-deletes planned items through the repository-backed remove flow', async () => {
    const repository = createRepository(createCompraSemanalList());
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    const updated = await useCases.removeItem('list-compra-semanal', 'item-2');

    expect(updated.items).toMatchObject([
      { deletedAt: null, quantityMilli: 2000, unitCode: 'piece' },
      { deletedAt: '2026-07-31T10:00:00.000Z', quantityMilli: 500000, unitCode: 'g' },
      { deletedAt: null, quantityMilli: 1500, unitCode: 'kg' },
    ]);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('restores a soft-deleted item in place', async () => {
    const repository = createRepository(createCompraSemanalList());
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    await useCases.removeItem('list-compra-semanal', 'item-2');
    const restored = await useCases.restoreItem('list-compra-semanal', 'item-2');

    expect(restored.items).toMatchObject([
      { deletedAt: null, quantityMilli: 2000, unitCode: 'piece' },
      { deletedAt: null, quantityMilli: 500000, unitCode: 'g' },
      { deletedAt: null, quantityMilli: 1500, unitCode: 'kg' },
    ]);
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('refuses to remove the last remaining visible item', async () => {
    const repository = createRepository({
      ...createShoppingList(),
      items: [createShoppingList().items[0]],
    });
    const useCases = createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    });

    await expect(useCases.removeItem('list-1', 'item-1')).rejects.toThrow(
      'At least one non-deleted item is required.'
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
