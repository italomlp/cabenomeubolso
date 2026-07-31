import { describe, expect, it, jest } from '@jest/globals';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createSQLiteBootstrap, type SQLiteBootstrapDependencies } from './bootstrap';
import { createSQLiteShoppingListRepository } from './shopping-list-repository';
import { SQLITE_DATABASE_VERSION, applySQLiteMigrations } from './migrations';

type MockSQLiteDatabase = {
  execAsync: jest.MockedFunction<(sql: string) => Promise<void>>;
  withExclusiveTransactionAsync?: (task: (database: MockSQLiteDatabase) => Promise<void>) => Promise<void>;
  withTransactionAsync: (task: () => Promise<void>) => Promise<void>;
};

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

describe('applySQLiteMigrations', () => {
  it('updates user_version inside the migration transaction', async () => {
    const execAsync: MockSQLiteDatabase['execAsync'] = jest
      .fn<(sql: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    const withExclusiveTransactionAsync = jest.fn(async (task: (database: MockSQLiteDatabase) => Promise<void>) => {
      await task(database);
    });
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => {
      await task();
    });
    const database = {
      execAsync,
      withExclusiveTransactionAsync,
      withTransactionAsync,
    } as unknown as MockSQLiteDatabase;

    await applySQLiteMigrations(database as never, 0);

    expect(withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
    expect(execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS shopping_lists'));
    expect(execAsync).toHaveBeenCalledWith(expect.stringContaining("currency_code TEXT NOT NULL CHECK (currency_code IN ('BRL', 'USD'))"));
    expect(execAsync).toHaveBeenCalledWith(expect.stringContaining("ALTER TABLE shopping_lists ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finalized'))"));
    expect(execAsync).toHaveBeenCalledWith(`PRAGMA user_version = ${SQLITE_DATABASE_VERSION};`);
  });

  it('skips the transaction when the database is already current', async () => {
    const execAsync: MockSQLiteDatabase['execAsync'] = jest
      .fn<(sql: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    const withTransactionAsync = jest.fn(async (_task: () => Promise<void>) => undefined);
    const database = {
      execAsync,
      withTransactionAsync,
    } as unknown as MockSQLiteDatabase;

    await applySQLiteMigrations(database as never, SQLITE_DATABASE_VERSION);

    expect(withTransactionAsync).not.toHaveBeenCalled();
    expect(execAsync).not.toHaveBeenCalled();
  });

  it('rolls back when a migration step fails before user_version advances', async () => {
    const execAsync: MockSQLiteDatabase['execAsync'] = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE shopping_lists ADD COLUMN status')) {
        throw new Error('migration failed');
      }

      return undefined;
    });
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => {
      await task();
    });
    const database = {
      execAsync,
      withTransactionAsync,
    } as unknown as MockSQLiteDatabase;

    await expect(applySQLiteMigrations(database as never, 1)).rejects.toThrow('migration failed');
    expect(execAsync).not.toHaveBeenCalledWith(`PRAGMA user_version = ${SQLITE_DATABASE_VERSION};`);
  });

  it('upgrades a v1 on-disk database and reads the migrated rows back after reopening', async () => {
    const databaseName = `migration-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
    const databasePath = join(tmpdir(), databaseName);

    try {
      const legacyDatabase = await createNodeSQLiteAdapter(databasePath);

      try {
        await legacyDatabase.execAsync(`
          PRAGMA journal_mode = WAL;
          PRAGMA foreign_keys = ON;

          CREATE TABLE IF NOT EXISTS shopping_lists (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            currency_code TEXT NOT NULL CHECK (currency_code IN ('BRL', 'USD')),
            budget_minor INTEGER NOT NULL CHECK (budget_minor >= 0),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS shopping_list_items (
            id TEXT PRIMARY KEY NOT NULL,
            list_id TEXT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            unit_code TEXT NOT NULL CHECK (unit_code IN ('piece', 'pack', 'kg', 'g', 'l', 'ml')),
            quantity_milli INTEGER NOT NULL CHECK (quantity_milli > 0),
            planned_unit_minor INTEGER NOT NULL CHECK (planned_unit_minor >= 0),
            actual_unit_minor INTEGER,
            purchased_at TEXT,
            sort_order INTEGER NOT NULL CHECK (sort_order > 0),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          INSERT INTO shopping_lists (
            id, name, currency_code, budget_minor, created_at, updated_at
          ) VALUES (
            'list-1', 'Weekly groceries', 'BRL', 4000, '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z'
          );

          INSERT INTO shopping_list_items (
            id, list_id, name, unit_code, quantity_milli, planned_unit_minor, actual_unit_minor,
            purchased_at, sort_order, created_at, updated_at
          ) VALUES (
            'item-1', 'list-1', 'Milk', 'piece', 2000, 600, 650,
            '2026-07-31T00:00:00.000Z', 1, '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z'
          );

          PRAGMA user_version = 1;
        `);
      } finally {
        await legacyDatabase.closeAsync();
      }

      const bootstrap = createSQLiteBootstrap({
        databaseName,
        openDatabaseAsync: (async () => createNodeSQLiteAdapter(databasePath)) as unknown as SQLiteBootstrapDependencies['openDatabaseAsync'],
      });
      const database = await bootstrap.ensureBootstrapped();
      const repository = createSQLiteShoppingListRepository(database as never);
      const list = await repository.get('list-1');
      const userVersion = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');

      expect(userVersion?.user_version).toBe(SQLITE_DATABASE_VERSION);
      expect(list).toMatchObject({
        budgetMinor: 4000,
        currencyCode: 'BRL',
        deletedAt: null,
        finalizedAt: null,
        id: 'list-1',
        name: 'Weekly groceries',
        status: 'draft',
        items: [
          {
            actualUnitMinor: 650,
            deletedAt: null,
            id: 'item-1',
            listId: 'list-1',
            name: 'Milk',
            plannedUnitMinor: 600,
            purchasedAt: '2026-07-31T00:00:00.000Z',
            quantityMilli: 2000,
            sortOrder: 1,
            unitCode: 'piece',
          },
        ],
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
