import type { SQLiteDatabase } from 'expo-sqlite';

export const SQLITE_DATABASE_VERSION = 2;

export type SQLiteMigration = {
  version: number;
  up: (database: SQLiteDatabase) => Promise<void>;
};

type SQLiteMigratorDatabase = SQLiteDatabase & {
  withExclusiveTransactionAsync?: (task: (txn: SQLiteDatabase) => Promise<void>) => Promise<void>;
  withTransactionAsync: (task: () => Promise<void>) => Promise<void>;
};

const MIGRATIONS: readonly SQLiteMigration[] = [
  {
    version: 1,
    up: async (database) => {
      await database.execAsync(`
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
          actual_unit_minor INTEGER CHECK (actual_unit_minor IS NULL OR actual_unit_minor >= 0),
          purchased_at TEXT,
          sort_order INTEGER NOT NULL CHECK (sort_order > 0),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id_sort_order
          ON shopping_list_items(list_id, sort_order);
      `);
    },
  },
  {
    version: 2,
    up: async (database) => {
      await database.execAsync(`
        ALTER TABLE shopping_lists ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finalized'));
        ALTER TABLE shopping_lists ADD COLUMN finalized_at TEXT;
        ALTER TABLE shopping_lists ADD COLUMN deleted_at TEXT;
        ALTER TABLE shopping_list_items ADD COLUMN deleted_at TEXT;

        CREATE INDEX IF NOT EXISTS idx_shopping_lists_status_deleted_at
          ON shopping_lists(status, deleted_at);

        CREATE INDEX IF NOT EXISTS idx_shopping_lists_deleted_at_updated_at
          ON shopping_lists(deleted_at, updated_at);

        CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id_deleted_at_sort_order
          ON shopping_list_items(list_id, deleted_at, sort_order);
      `);
    },
  },
];

export async function applySQLiteMigrations(database: SQLiteDatabase, currentVersion: number) {
  if (currentVersion >= SQLITE_DATABASE_VERSION) {
    return;
  }

  const runMigrations = async (transaction: SQLiteDatabase) => {
    for (const migration of MIGRATIONS) {
      if (migration.version <= currentVersion) {
        continue;
      }

      await migration.up(transaction);
    }

    await transaction.execAsync(`PRAGMA user_version = ${SQLITE_DATABASE_VERSION};`);
  };

  const migratorDatabase = database as SQLiteMigratorDatabase;

  if (migratorDatabase.withExclusiveTransactionAsync !== undefined) {
    await migratorDatabase.withExclusiveTransactionAsync(runMigrations);
    return;
  }

  await migratorDatabase.withTransactionAsync(async () => {
    await runMigrations(database);
  });
}
