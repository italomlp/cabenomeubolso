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

function createCompraSemanalShoppingList() {
  return {
    budgetMinor: 12_345,
    createdAt: '2026-07-31T00:00:00.000Z',
    currencyCode: 'BRL' as const,
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
        unitCode: 'piece' as const,
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
        unitCode: 'g' as const,
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
        unitCode: 'kg' as const,
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
    ],
    name: 'Compra semanal',
    status: 'draft' as const,
    updatedAt: '2026-07-31T00:00:00.000Z',
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

  it('treats expo-sqlite null as an absent list when saving the first list', async () => {
    const getFirstAsync = jest.fn(async () => null);
    const database = {
      getAllAsync: jest.fn(async () => []),
      getFirstAsync,
      runAsync: jest.fn(async () => undefined),
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);

    await expect(repository.save(createCompraSemanalShoppingList())).resolves.toBeUndefined();
    expect(getFirstAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO shopping_lists'),
      'list-compra-semanal',
      'Compra semanal',
      'BRL',
      12_345,
      'draft',
      null,
      null,
      '2026-07-31T00:00:00.000Z',
      '2026-07-31T00:00:00.000Z'
    );
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

  it('rejects saving an empty list graph', async () => {
    const database = {
      getAllAsync: jest.fn(async () => []),
      getFirstAsync: jest.fn(async () => undefined),
      runAsync: jest.fn(async () => undefined),
      withExclusiveTransactionAsync: jest.fn(async () => undefined),
      withTransactionAsync: jest.fn(async () => undefined),
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
        items: [],
        name: 'Weekly groceries',
        status: 'draft',
        updatedAt: '2026-07-31T00:00:00.000Z',
      })
    ).rejects.toThrow('items: At least one non-deleted item is required.');

    expect(database.withExclusiveTransactionAsync).not.toHaveBeenCalled();
    expect(database.withTransactionAsync).not.toHaveBeenCalled();
    expect(database.runAsync).not.toHaveBeenCalled();
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

  it('round-trips Compra semanal exact quantities and units through the SQLite adapter', async () => {
    const state = {
      items: new Map<string, Record<string, unknown>>(),
      list: undefined as Record<string, unknown> | undefined,
    };

    const runAsync = jest.fn(async (sql: string, ...params: readonly unknown[]) => {
      const normalizedSql = sql.trim().replace(/\s+/g, ' ');

      if (normalizedSql.startsWith('INSERT INTO shopping_lists')) {
        state.list = {
          budget_minor: params[3],
          created_at: params[7],
          currency_code: params[2],
          deleted_at: params[6],
          finalized_at: params[5],
          id: params[0],
          name: params[1],
          status: params[4],
          updated_at: params[8],
        };
      }

      if (normalizedSql.startsWith('INSERT INTO shopping_list_items')) {
        state.items.set(String(params[0]), {
          actual_unit_minor: params[6],
          created_at: params[10],
          deleted_at: params[9],
          id: params[0],
          list_id: params[1],
          name: params[2],
          planned_unit_minor: params[5],
          purchased_at: params[7],
          quantity_milli: params[4],
          sort_order: params[8],
          unit_code: params[3],
          updated_at: params[11],
        });
      }

      return undefined;
    });
    const database = {
      getAllAsync: jest.fn(async <T>(sql: string, ...params: readonly unknown[]) => {
        if (sql.includes('FROM shopping_lists')) {
          return state.list === undefined ? [] : ([state.list] as readonly T[]);
        }

        if (sql.includes('FROM shopping_list_items')) {
          return [...state.items.values()]
            .filter((row) => row.list_id === params[0])
            .map((row) => row as T) as readonly T[];
        }

        return [];
      }),
      getFirstAsync: jest.fn(async <T>(sql: string, ...params: readonly unknown[]) => {
        if (sql.includes('FROM shopping_lists')) {
          return state.list !== undefined && state.list.id === params[0] ? (state.list as T) : undefined;
        }

        return undefined;
      }),
      runAsync,
      withExclusiveTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
      withTransactionAsync: jest.fn(async (task: TransactionTask) => task(database as never)),
    } as unknown as SQLiteShoppingListRepositoryDatabase;

    const repository = createSQLiteShoppingListRepository(database);
    const shoppingList = createCompraSemanalShoppingList();

    await repository.save(shoppingList);

    expect(runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO shopping_list_items'), 'item-1', 'list-compra-semanal', 'Eggs', 'piece', 2000, 350, null, null, 1, null, '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z');

    const loaded = await repository.get('list-compra-semanal');

    expect(loaded).toMatchObject({
      budgetMinor: 12_345,
      currencyCode: 'BRL',
      items: [
        { quantityMilli: 2000, unitCode: 'piece' },
        { quantityMilli: 500000, unitCode: 'g' },
        { quantityMilli: 1500, unitCode: 'kg' },
      ],
      name: 'Compra semanal',
      status: 'draft',
    });
  });
});
