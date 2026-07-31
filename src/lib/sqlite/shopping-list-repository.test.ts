import { describe, expect, it, jest } from '@jest/globals';

import { createSQLiteShoppingListRepository, mapShoppingListItemRow, mapShoppingListRow } from './shopping-list-repository';
import type { SQLiteShoppingListRepositoryDatabase } from './shopping-list-repository';

type TransactionTask = (database: SQLiteShoppingListRepositoryDatabase) => Promise<void>;

function createShoppingList(): Parameters<typeof mapShoppingListRow>[0] {
  return {
    budget_minor: 4000,
    created_at: '2026-07-31T00:00:00.000Z',
    currency_code: 'BRL',
    id: 'list-1',
    name: ' Weekly groceries ',
    updated_at: '2026-07-31T00:00:00.000Z',
  };
}

function createShoppingListItem(): Parameters<typeof mapShoppingListItemRow>[0] {
  return {
    actual_unit_minor: 650,
    created_at: '2026-07-31T00:00:00.000Z',
    id: 'item-1',
    list_id: 'list-1',
    name: ' Milk ',
    planned_unit_minor: 600,
    purchased_at: '2026-07-31T00:00:00.000Z',
    quantity_milli: 2000,
    sort_order: 1,
    unit_code: 'piece',
    updated_at: '2026-07-31T00:00:00.000Z',
  };
}

describe('createSQLiteShoppingListRepository', () => {
  it('filters deleted rows by default and maps legacy rows without losing currency or quantity data', async () => {
    const getFirstAsync = jest.fn(async () => createShoppingList());
    const getAllAsync = jest.fn(async () => [createShoppingListItem()]);
    const database = {
      getAllAsync,
      getFirstAsync,
      runAsync: jest.fn(async () => undefined),
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);
    const list = await repository.get('list-1');

    expect(getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('deleted_at IS NULL'), 'list-1');
    expect(getAllAsync).toHaveBeenCalledWith(expect.stringContaining('deleted_at IS NULL'), 'list-1');
    expect(list).toMatchObject({
      budgetMinor: 4000,
      currencyCode: 'BRL',
      name: 'Weekly groceries',
      status: 'draft',
      items: [
        {
          actualUnitMinor: 650,
          name: 'Milk',
          plannedUnitMinor: 600,
          quantityMilli: 2000,
          unitCode: 'piece',
        },
      ],
    });
  });

  it('preserves soft-deleted item rows when saving the current list graph', async () => {
    const shoppingList = {
      budgetMinor: 4000,
      createdAt: '2026-07-31T00:00:00.000Z',
      currencyCode: 'BRL' as const,
      deletedAt: null,
      finalizedAt: null,
      id: 'list-1',
      items: [
        {
          actualUnitMinor: 650,
          createdAt: '2026-07-31T00:00:00.000Z',
          deletedAt: null,
          id: 'item-1',
          listId: 'list-1',
          name: 'Milk',
          plannedUnitMinor: 600,
          purchasedAt: '2026-07-31T00:00:00.000Z',
          quantityMilli: 2000,
          sortOrder: 1,
          unitCode: 'piece' as const,
          updatedAt: '2026-07-31T00:00:00.000Z',
        },
      ],
      name: 'Weekly groceries',
      status: 'draft' as const,
      updatedAt: '2026-07-31T00:00:00.000Z',
    };

    const committedState = {
      items: new Map<string, { deleted_at: string | null }>([['item-history', { deleted_at: '2026-07-30T00:00:00.000Z' }]]),
      list: undefined as { currency_code: string; id: string } | undefined,
    };
    let draftState: typeof committedState | null = null;
    const runAsync = jest.fn(async (sql: string, ...params: readonly unknown[]) => {
      if (draftState === null) {
        throw new Error('transaction not started');
      }

      const normalizedSql = sql.trim().replace(/\s+/g, ' ');

      if (normalizedSql.startsWith('INSERT INTO shopping_lists')) {
        draftState.list = {
          currency_code: String(params[2]),
          id: String(params[0]),
        };
      }

      if (normalizedSql.startsWith('INSERT INTO shopping_list_items')) {
        const itemId = String(params[0]);
        draftState.items.set(itemId, { deleted_at: params[9] as string | null });
      }

      return undefined;
    });
    const database = {
      getAllAsync: jest.fn(async () => []),
      getFirstAsync: jest.fn(async () => undefined),
      runAsync,
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => {
        draftState = {
          items: new Map(committedState.items),
          list: committedState.list ? { ...committedState.list } : undefined,
        };

        try {
          await task(database as never);
          committedState.items = new Map(draftState.items);
          committedState.list = draftState.list ? { ...draftState.list } : undefined;
        } finally {
          draftState = null;
        }
      }),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await repository.save(shoppingList);

    expect(runAsync).not.toHaveBeenCalledWith(expect.stringContaining('DELETE FROM shopping_list_items'), expect.anything());
    expect(committedState.items.has('item-history')).toBe(true);
    expect(committedState.items.get('item-history')).toEqual({ deleted_at: '2026-07-30T00:00:00.000Z' });
    expect(committedState.items.has('item-1')).toBe(true);
  });

  it('rejects invalid database rows before mapping them into domain models', async () => {
    const getFirstAsync = jest.fn(async () => ({
      budget_minor: -10,
      created_at: '2026-07-31T00:00:00.000Z',
      currency_code: 'EUR',
      id: 'list-1',
      name: 'Weekly groceries',
      status: 'draft',
      updated_at: '2026-07-31T00:00:00.000Z',
    }));
    const getAllAsync = jest.fn(async () => []);
    const database = {
      getAllAsync,
      getFirstAsync,
      runAsync: jest.fn(async () => undefined),
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await expect(repository.get('list-1')).rejects.toThrow('Shopping list row');
  });

  it('rejects invalid item rows before mapping them into domain models', async () => {
    const getFirstAsync = jest.fn(async () => ({
      budget_minor: 4000,
      created_at: '2026-07-31T00:00:00.000Z',
      currency_code: 'BRL',
      id: 'list-1',
      name: 'Weekly groceries',
      status: 'draft',
      updated_at: '2026-07-31T00:00:00.000Z',
    }));
    const getAllAsync = jest.fn(async () => [
      {
        actual_unit_minor: -1,
        created_at: '2026-07-31T00:00:00.000Z',
        deleted_at: null,
        id: 'item-1',
        list_id: 'list-1',
        name: 'Milk',
        planned_unit_minor: 600,
        purchased_at: null,
        quantity_milli: 2000,
        sort_order: 1,
        unit_code: 'piece',
        updated_at: '2026-07-31T00:00:00.000Z',
      },
    ]);
    const database = {
      getAllAsync,
      getFirstAsync,
      runAsync: jest.fn(async () => undefined),
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await expect(repository.get('list-1')).rejects.toThrow('Shopping list item row');
  });

  it('saves the list graph atomically and rolls back on write failure', async () => {
    const shoppingList = {
      budgetMinor: 4000,
      createdAt: '2026-07-31T00:00:00.000Z',
      currencyCode: 'BRL' as const,
      deletedAt: null,
      finalizedAt: null,
      id: 'list-1',
      items: [
        {
          actualUnitMinor: 650,
          createdAt: '2026-07-31T00:00:00.000Z',
          deletedAt: null,
          id: 'item-1',
          listId: 'list-1',
          name: 'Milk',
          plannedUnitMinor: 600,
          purchasedAt: '2026-07-31T00:00:00.000Z',
          quantityMilli: 2000,
          sortOrder: 1,
          unitCode: 'piece' as const,
          updatedAt: '2026-07-31T00:00:00.000Z',
        },
        {
          actualUnitMinor: null,
          createdAt: '2026-07-31T00:00:00.000Z',
          deletedAt: null,
          id: 'item-2',
          listId: 'list-1',
          name: 'Rice',
          plannedUnitMinor: 2500,
          purchasedAt: null,
          quantityMilli: 1000,
          sortOrder: 2,
          unitCode: 'piece' as const,
          updatedAt: '2026-07-31T00:00:00.000Z',
        },
      ],
      name: 'Weekly groceries',
      status: 'draft' as const,
      updatedAt: '2026-07-31T00:00:00.000Z',
    };

    const committedState = {
      items: [] as string[],
      listIds: [] as string[],
    };
    let draftState: typeof committedState | null = null;
    const runAsync = jest.fn(async (sql: string, ...params: readonly unknown[]) => {
      if (draftState === null) {
        throw new Error('transaction not started');
      }

      const normalizedSql = sql.trim().replace(/\s+/g, ' ');

      if (normalizedSql.startsWith('INSERT INTO shopping_lists')) {
        draftState.listIds = [String(params[0])];
      }

      if (normalizedSql.startsWith('INSERT INTO shopping_list_items')) {
        const itemId = String(params[0]);
        draftState.items = [...draftState.items, itemId];

        if (itemId === 'item-2') {
          throw new Error('write failed');
        }
      }

      return undefined;
    });
    const database = {
      getAllAsync: jest.fn(async () => []),
      getFirstAsync: jest.fn(async () => undefined),
      runAsync,
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => {
        const snapshot = {
          items: [...committedState.items],
          listIds: [...committedState.listIds],
        };
        draftState = {
          items: [...committedState.items],
          listIds: [...committedState.listIds],
        };

        try {
          await task(database as never);
          committedState.items = [...draftState.items];
          committedState.listIds = [...draftState.listIds];
        } catch (error) {
          committedState.items = snapshot.items;
          committedState.listIds = snapshot.listIds;
          throw error;
        } finally {
          draftState = null;
        }
      }),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => {
        await task(database as never);
      }),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await expect(repository.save(shoppingList)).rejects.toThrow('write failed');
    expect(committedState).toEqual({ items: [], listIds: [] });
    expect(runAsync).toHaveBeenCalled();
  });

  it('prevents changing currency after persisted actual spending exists', async () => {
    const getFirstAsync = jest.fn(async () => ({
      budget_minor: 4000,
      created_at: '2026-07-31T00:00:00.000Z',
      currency_code: 'BRL',
      deleted_at: null,
      finalized_at: null,
      id: 'list-1',
      name: 'Weekly groceries',
      status: 'draft',
      updated_at: '2026-07-31T00:00:00.000Z',
    }));
    const getAllAsync = jest.fn(async () => [
      {
        actual_unit_minor: 650,
        created_at: '2026-07-31T00:00:00.000Z',
        deleted_at: '2026-07-31T00:00:00.000Z',
        id: 'item-1',
        list_id: 'list-1',
        name: 'Milk',
        planned_unit_minor: 600,
        purchased_at: '2026-07-31T00:00:00.000Z',
        quantity_milli: 2000,
        sort_order: 1,
        unit_code: 'piece',
        updated_at: '2026-07-31T00:00:00.000Z',
      },
    ]);
    const runAsync = jest.fn(async () => undefined);
    const database = {
      getAllAsync,
      getFirstAsync,
      runAsync,
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await expect(
      repository.save({
        budgetMinor: 4000,
        createdAt: '2026-07-31T00:00:00.000Z',
        currencyCode: 'USD',
        deletedAt: null,
        finalizedAt: null,
        id: 'list-1',
        items: [
          {
            actualUnitMinor: null,
            createdAt: '2026-07-31T00:00:00.000Z',
            deletedAt: null,
            id: 'item-2',
            listId: 'list-1',
            name: 'Rice',
            plannedUnitMinor: 2500,
            purchasedAt: null,
            quantityMilli: 1000,
            sortOrder: 1,
            unitCode: 'piece',
            updatedAt: '2026-07-31T00:00:00.000Z',
          },
        ],
        name: 'Weekly groceries',
        status: 'draft',
        updatedAt: '2026-07-31T00:00:00.000Z',
      })
    ).rejects.toThrow('Cannot change the currency of a saved list with existing items or actual spending.');
    expect(getFirstAsync).toHaveBeenCalledTimes(1);
    expect(getAllAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).not.toHaveBeenCalled();
  });

  it('re-checks the saved list currency lock inside the exclusive write transaction', async () => {
    let currencyCode = 'BRL';
    const getFirstAsync = jest.fn(async () => ({
      budget_minor: 4000,
      created_at: '2026-07-31T00:00:00.000Z',
      currency_code: currencyCode,
      deleted_at: null,
      finalized_at: null,
      id: 'list-1',
      name: 'Weekly groceries',
      status: 'draft',
      updated_at: '2026-07-31T00:00:00.000Z',
    }));
    const getAllAsync = jest.fn(async () => [
      {
        actual_unit_minor: null,
        created_at: '2026-07-31T00:00:00.000Z',
        deleted_at: null,
        id: 'item-1',
        list_id: 'list-1',
        name: 'Milk',
        planned_unit_minor: 600,
        purchased_at: null,
        quantity_milli: 2000,
        sort_order: 1,
        unit_code: 'piece',
        updated_at: '2026-07-31T00:00:00.000Z',
      },
    ]);
    const runAsync = jest.fn(async () => undefined);
    const database = {
      getAllAsync,
      getFirstAsync,
      runAsync,
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => {
        currencyCode = 'USD';
        await task(database as never);
      }),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await expect(
      repository.save({
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
            id: 'item-2',
            listId: 'list-1',
            name: 'Rice',
            plannedUnitMinor: 2500,
            purchasedAt: null,
            quantityMilli: 1000,
            sortOrder: 1,
            unitCode: 'piece',
            updatedAt: '2026-07-31T00:00:00.000Z',
          },
        ],
        name: 'Weekly groceries',
        status: 'draft',
        updatedAt: '2026-07-31T00:00:00.000Z',
      })
    ).rejects.toThrow('Cannot change the currency of a saved list with existing items or actual spending.');

    expect(getFirstAsync).toHaveBeenCalledTimes(1);
    expect(getAllAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).not.toHaveBeenCalled();
    expect(database.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
  });
});
