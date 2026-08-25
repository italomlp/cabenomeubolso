import { describe, expect, it } from '@jest/globals';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createShoppingListUseCases } from '@/domain/shopping-list-use-cases';
import type { ShoppingList } from '@/domain/shopping-list';
import { buildCreateListDraft, createCreateListDraftStateFromList, createEmptyCreateListDraftState } from '@/app/home-state';

import { createSQLiteBootstrap } from './bootstrap';
import { createSQLiteShoppingListRepository } from './shopping-list-repository';

type NodeSQLiteStatement = {
  all: (...params: readonly unknown[]) => readonly Record<string, unknown>[];
  get: (...params: readonly unknown[]) => Record<string, unknown> | undefined;
  run: (...params: readonly unknown[]) => { changes: number; lastInsertRowid: number | bigint };
};

type NodeSQLiteNativeDatabase = {
  close: () => void;
  exec: (sql: string) => void;
  prepare: (sql: string) => NodeSQLiteStatement;
};

type NodeSQLiteAdapter = {
  closeAsync: () => Promise<void>;
  execAsync: (sql: string) => Promise<void>;
  getAllAsync: <T>(sql: string, ...params: readonly unknown[]) => Promise<readonly T[]>;
  getFirstAsync: <T>(sql: string, ...params: readonly unknown[]) => Promise<T | undefined>;
  runAsync: (sql: string, ...params: readonly unknown[]) => Promise<unknown>;
  withExclusiveTransactionAsync: (task: (database: NodeSQLiteAdapter) => Promise<void>) => Promise<void>;
  withTransactionAsync: (task: (database: NodeSQLiteAdapter) => Promise<void>) => Promise<void>;
};

function createTrashList(id: string, deletedAt: string | null = null): ShoppingList {
  const timestamp = '2026-08-01T00:00:00.000Z';
  return {
    budgetMinor: 4_000,
    createdAt: timestamp,
    currencyCode: 'BRL' as const,
    deletedAt,
    finalizedAt: null,
    id,
    items: [
      {
        actualUnitMinor: null,
        createdAt: timestamp,
        deletedAt: null,
        id: `${id}-item-1`,
        listId: id,
        name: 'Milk',
        plannedUnitMinor: 600,
        purchasedAt: null,
        quantityMilli: 1_000,
        sortOrder: 1,
        unitCode: 'piece' as const,
        updatedAt: timestamp,
      },
      {
        actualUnitMinor: null,
        createdAt: timestamp,
        deletedAt: null,
        id: `${id}-item-2`,
        listId: id,
        name: 'Rice',
        plannedUnitMinor: 1_000,
        purchasedAt: null,
        quantityMilli: 1_000,
        sortOrder: 2,
        unitCode: 'piece' as const,
        updatedAt: timestamp,
      },
    ],
    name: id,
    status: 'draft' as const,
    updatedAt: timestamp,
  };
}

async function createNodeSQLiteAdapter(databasePath: string): Promise<NodeSQLiteAdapter> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (path: string) => NodeSQLiteNativeDatabase;
  };
  const database = new DatabaseSync(databasePath);

  const adapter: NodeSQLiteAdapter = {
    closeAsync: async () => {
      database.close();
    },
    execAsync: async (sql: string) => {
      database.exec(sql);
    },
    getAllAsync: async <T>(sql: string, ...params: readonly unknown[]) => {
      return database.prepare(sql).all(...params) as readonly T[];
    },
    getFirstAsync: async <T>(sql: string, ...params: readonly unknown[]) => {
      return database.prepare(sql).get(...params) as T | undefined;
    },
    runAsync: async (sql: string, ...params: readonly unknown[]) => {
      return database.prepare(sql).run(...params);
    },
    withExclusiveTransactionAsync: async (task: (database: NodeSQLiteAdapter) => Promise<void>) => {
      database.exec('BEGIN');

      try {
        await task(adapter);
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
    withTransactionAsync: async (task: (database: NodeSQLiteAdapter) => Promise<void>) => {
      database.exec('BEGIN');

      try {
        await task(adapter);
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return adapter;
}

describe('SQLite shopping list persistence', () => {
  it('persists two newly created lists with distinct item identities', async () => {
    const databaseName = `shopping-list-identities-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
    const databasePath = join(tmpdir(), databaseName);

    try {
      const bootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as never,
      });
      const database = await bootstrap.ensureBootstrapped();
      const repository = createSQLiteShoppingListRepository(database as never);
      const first = buildCreateListDraft(
        { ...createEmptyCreateListDraftState('BRL'), budgetText: '10', itemCount: 1, name: 'First list' },
        '2026-08-12T00:00:00.000Z'
      );
      const second = buildCreateListDraft(
        { ...createEmptyCreateListDraftState('BRL'), budgetText: '10', itemCount: 1, name: 'Second list' },
        '2026-08-12T00:00:00.000Z'
      );

      await repository.save(first);
      await repository.save(second);

      const persistedFirst = await repository.get(first.id);
      const persistedSecond = await repository.get(second.id);

      expect(persistedFirst?.id).not.toBe(persistedSecond?.id);
      expect(persistedFirst?.items[0]?.id).not.toBe(persistedSecond?.items[0]?.id);
      expect(persistedFirst?.items[0]?.listId).toBe(persistedFirst?.id);
      expect(persistedSecond?.items[0]?.listId).toBe(persistedSecond?.id);
    } finally {
      const walPath = `${databasePath}-wal`;
      const shmPath = `${databasePath}-shm`;

      for (const path of [databasePath, walPath, shmPath]) {
        try {
          unlinkSync(path);
        } catch {
          // Ignore cleanup races in tests.
        }
      }
    }
  });

  it('lists deleted parents only and restores a parent without restoring nested deleted items', async () => {
    const databaseName = `shopping-list-trash-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
    const databasePath = join(tmpdir(), databaseName);
    const deletedAt = '2026-08-04T00:00:00.000Z';

    try {
      const bootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as never,
      });
      const database = await bootstrap.ensureBootstrapped();
      const repository = createSQLiteShoppingListRepository(database as never);
      const useCases = createShoppingListUseCases({ now: () => '2026-08-05T00:00:00.000Z', repository });
      const activeListBase = createTrashList('active-list');
      const activeList = {
        ...activeListBase,
        items: activeListBase.items.map((item, index) => index === 1 ? { ...item, deletedAt, updatedAt: deletedAt } : item),
      };
      const deletedListBase = createTrashList('deleted-list', deletedAt);
      const deletedList = {
        ...deletedListBase,
        items: deletedListBase.items.map((item, index) => index === 1 ? { ...item, deletedAt, updatedAt: deletedAt } : item),
      };

      await repository.save(activeList);
      await repository.save(deletedList);

      const trash = await useCases.listTrash();

      expect(trash.map((list) => list.id)).toEqual(['deleted-list']);
      expect(trash[0]?.items[1]).toMatchObject({ deletedAt });

      const restored = await useCases.restoreList('deleted-list');
      expect(restored.deletedAt).toBeNull();
      expect(restored.items[1]?.deletedAt).toBe(deletedAt);

      const restoredFromDatabase = await repository.get('deleted-list', { includeDeleted: true });
      expect(restoredFromDatabase).toMatchObject({ deletedAt: null });
      expect(restoredFromDatabase?.items[1]?.deletedAt).toBe(deletedAt);
    } finally {
      const walPath = `${databasePath}-wal`;
      const shmPath = `${databasePath}-shm`;

      for (const path of [databasePath, walPath, shmPath]) {
        try {
          unlinkSync(path);
        } catch {
          // Ignore cleanup races in tests.
        }
      }
    }
  });

  it('purges expired parents and cascades all nested rows while retaining recent trash', async () => {
    const databaseName = `shopping-list-purge-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
    const databasePath = join(tmpdir(), databaseName);

    try {
      const bootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as never,
      });
      const database = await bootstrap.ensureBootstrapped();
      const repository = createSQLiteShoppingListRepository(database as never);
      const useCases = createShoppingListUseCases({ now: () => '2026-08-08T00:00:00.000Z', repository });
      const oldDeletedList = createTrashList('old-deleted-list', '2026-08-01T00:00:00.000Z');
      const recentDeletedList = createTrashList('recent-deleted-list', '2026-08-02T00:00:00.000Z');

      await repository.save(oldDeletedList);
      await repository.save(recentDeletedList);
      await useCases.cleanupExpiredTrash();

      expect(await repository.get('old-deleted-list', { includeDeleted: true })).toBeNull();
      expect(await repository.get('recent-deleted-list', { includeDeleted: true })).not.toBeNull();
      const trash = await useCases.listTrash();
      expect(trash).toHaveLength(1);
      expect(trash[0]?.id).toBe('recent-deleted-list');
    } finally {
      const walPath = `${databasePath}-wal`;
      const shmPath = `${databasePath}-shm`;

      for (const path of [databasePath, walPath, shmPath]) {
        try {
          unlinkSync(path);
        } catch {
          // Ignore cleanup races in tests.
        }
      }
    }
  });

  it('preserves list metadata when an existing list is edited and saved', async () => {
    const databaseName = `shopping-list-metadata-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
    const databasePath = join(tmpdir(), databaseName);
    const createdAt = '2026-08-01T00:00:00.000Z';
    const finalizedAt = '2026-08-09T00:00:00.000Z';
    const deletedAt = '2026-08-10T00:00:00.000Z';

    try {
      const bootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as never,
      });
      const database = await bootstrap.ensureBootstrapped();
      const repository = createSQLiteShoppingListRepository(database as never);
      const useCases = createShoppingListUseCases({ repository });
      const original = buildCreateListDraft(
        {
          ...createEmptyCreateListDraftState('BRL'),
          budgetText: '10',
          createdAt,
          deletedAt,
          finalizedAt,
          itemCount: 1,
          name: 'Original name',
        },
        '2026-08-11T00:00:00.000Z'
      );

      await useCases.saveList(original);
      const loaded = await useCases.loadList(original.id, true);
      expect(loaded).not.toBeNull();

      const edited = buildCreateListDraft(
        { ...createCreateListDraftStateFromList(loaded!, 'en'), name: 'Edited name' },
        '2026-08-12T00:00:00.000Z'
      );
      await useCases.saveList(edited);
      const persisted = await useCases.loadList(original.id, true);

      expect(persisted).toMatchObject({
        createdAt,
        deletedAt,
        finalizedAt,
        name: 'Edited name',
        status: 'draft',
      });
    } finally {
      const walPath = `${databasePath}-wal`;
      const shmPath = `${databasePath}-shm`;

      for (const path of [databasePath, walPath, shmPath]) {
        try {
          unlinkSync(path);
        } catch {
          // Ignore cleanup races in tests.
        }
      }
    }
  });

  it('preserves exact values and currency across save, finalize, reopen, and reload', async () => {
    const databaseName = `shopping-list-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
    const databasePath = join(tmpdir(), databaseName);

    try {
      const bootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as never,
      });
      const database = await bootstrap.ensureBootstrapped();
      const repository = createSQLiteShoppingListRepository(database as never);
      const useCases = createShoppingListUseCases({ repository, now: () => '2026-08-04T12:00:00.000Z' });

      const shoppingList = {
        budgetMinor: 12_345,
        createdAt: '2026-08-04T12:00:00.000Z',
        currencyCode: 'USD' as const,
        deletedAt: null,
        finalizedAt: null,
        id: 'list-compra-semanal',
        items: [
          {
            actualUnitMinor: null,
            createdAt: '2026-08-04T12:00:00.000Z',
            deletedAt: null,
            id: 'item-1',
            listId: 'list-compra-semanal',
            name: 'Eggs',
            plannedUnitMinor: 350,
            purchasedAt: null,
            quantityMilli: 2000,
            sortOrder: 1,
            unitCode: 'piece' as const,
            updatedAt: '2026-08-04T12:00:00.000Z',
          },
          {
            actualUnitMinor: null,
            createdAt: '2026-08-04T12:00:00.000Z',
            deletedAt: null,
            id: 'item-2',
            listId: 'list-compra-semanal',
            name: 'Rice',
            plannedUnitMinor: 1000,
            purchasedAt: null,
            quantityMilli: 500000,
            sortOrder: 2,
            unitCode: 'g' as const,
            updatedAt: '2026-08-04T12:00:00.000Z',
          },
          {
            actualUnitMinor: null,
            createdAt: '2026-08-04T12:00:00.000Z',
            deletedAt: null,
            id: 'item-3',
            listId: 'list-compra-semanal',
            name: 'Potatoes',
            plannedUnitMinor: 200,
            purchasedAt: null,
            quantityMilli: 1500,
            sortOrder: 3,
            unitCode: 'kg' as const,
            updatedAt: '2026-08-04T12:00:00.000Z',
          },
        ],
        name: 'Compra semanal',
        status: 'draft' as const,
        updatedAt: '2026-08-04T12:00:00.000Z',
      };

      await useCases.saveList(shoppingList);
      const finalized = await useCases.finalizeList('list-compra-semanal', { confirmUnpurchased: true });
      const reopened = await useCases.reopenList('list-compra-semanal');
      const loaded = await useCases.loadList('list-compra-semanal', true);

      expect(finalized).toMatchObject({ currencyCode: 'USD', finalizedAt: '2026-08-04T12:00:00.000Z', status: 'finalized' });
      expect(reopened).toMatchObject({ currencyCode: 'USD', finalizedAt: null, status: 'draft' });
      expect(loaded).toMatchObject({
        budgetMinor: 12_345,
        currencyCode: 'USD',
        finalizedAt: null,
        items: [
          { quantityMilli: 2000, unitCode: 'piece' },
          { quantityMilli: 500000, unitCode: 'g' },
          { quantityMilli: 1500, unitCode: 'kg' },
        ],
        name: 'Compra semanal',
        status: 'draft',
      });

      await database.closeAsync?.();

      const reopenedBootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as never,
      });
      const reopenedDatabase = await reopenedBootstrap.ensureBootstrapped();
      const reopenedRepository = createSQLiteShoppingListRepository(reopenedDatabase as never);
      const reloaded = await reopenedRepository.get('list-compra-semanal', { includeDeleted: true });

      expect(reloaded).toMatchObject({
        budgetMinor: 12_345,
        currencyCode: 'USD',
        finalizedAt: null,
        items: [
          { quantityMilli: 2000, unitCode: 'piece' },
          { quantityMilli: 500000, unitCode: 'g' },
          { quantityMilli: 1500, unitCode: 'kg' },
        ],
        name: 'Compra semanal',
        status: 'draft',
      });
    } finally {
      const walPath = `${databasePath}-wal`;
      const shmPath = `${databasePath}-shm`;

      for (const path of [databasePath, walPath, shmPath]) {
        try {
          unlinkSync(path);
        } catch {
          // Ignore cleanup races in tests.
        }
      }
    }
  });
});
