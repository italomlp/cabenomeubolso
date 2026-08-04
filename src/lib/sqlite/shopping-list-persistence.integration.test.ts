import { describe, expect, it } from '@jest/globals';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createShoppingListUseCases } from '@/domain/shopping-list-use-cases';

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
      const finalized = await useCases.finalizeList('list-compra-semanal');
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
