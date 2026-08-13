import * as SQLite from 'expo-sqlite';

import { SQLITE_DATABASE_VERSION, applySQLiteMigrations } from './migrations';
import { getShoppingListTrashCutoff } from '@/domain/shopping-list';

export type SQLiteBootstrapDependencies = {
  databaseName?: string;
  openDatabaseAsync?: typeof SQLite.openDatabaseAsync;
};

type SQLiteDatabase = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

const DEFAULT_DATABASE_NAME = 'cabenomeubolso.db';

export function createSQLiteBootstrap({
  databaseName = DEFAULT_DATABASE_NAME,
  openDatabaseAsync = SQLite.openDatabaseAsync,
}: SQLiteBootstrapDependencies = {}) {
  let bootstrapPromise: Promise<SQLiteDatabase> | null = null;

  const initializeDatabase = async () => {
    const database = await openDatabaseAsync(databaseName);
    await database.execAsync('PRAGMA journal_mode = WAL;');
    await database.execAsync('PRAGMA foreign_keys = ON;');

    const currentVersionRow = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version;'
    );
    const currentVersion = currentVersionRow?.user_version ?? 0;

    if (currentVersion < SQLITE_DATABASE_VERSION) {
      await applySQLiteMigrations(database, currentVersion);
    }

    // Expired trash is best-effort foreground maintenance. A failed cleanup must
    // not prevent an otherwise usable database from opening.
    const maintenanceDatabase = database as SQLiteDatabase & {
      runAsync?: (sql: string, ...params: readonly unknown[]) => Promise<unknown>;
    };
    if (maintenanceDatabase.runAsync !== undefined) {
      try {
        const cutoff = getShoppingListTrashCutoff(new Date().toISOString());
        await database.withTransactionAsync(async () => {
          await maintenanceDatabase.runAsync?.(
            `DELETE FROM shopping_list_items WHERE deleted_at IS NOT NULL AND deleted_at <= ?`,
            cutoff
          );
          await maintenanceDatabase.runAsync?.(
            `DELETE FROM shopping_list_items WHERE list_id IN (SELECT id FROM shopping_lists WHERE deleted_at IS NOT NULL AND deleted_at <= ?)`,
            cutoff
          );
          await maintenanceDatabase.runAsync?.(
            `DELETE FROM shopping_lists WHERE deleted_at IS NOT NULL AND deleted_at <= ?`,
            cutoff
          );
        });
      } catch {
        // Maintenance is retryable on the next foreground event.
      }
    }

    return database;
  };

  return {
    ensureBootstrapped: () => {
      if (bootstrapPromise === null) {
        bootstrapPromise = initializeDatabase().catch((error: unknown) => {
          bootstrapPromise = null;
          throw error;
        });
      }

      return bootstrapPromise;
    },
    resetForTests: () => {
      bootstrapPromise = null;
    },
  };
}

export const sqliteBootstrap = createSQLiteBootstrap();

export const ensureSQLiteBootstrapped = () => sqliteBootstrap.ensureBootstrapped();
