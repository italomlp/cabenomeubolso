import * as SQLite from 'expo-sqlite';

import { SQLITE_DATABASE_VERSION, applySQLiteMigrations } from './migrations';

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

    const currentVersionRow = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version;'
    );
    const currentVersion = currentVersionRow?.user_version ?? 0;

    if (currentVersion < SQLITE_DATABASE_VERSION) {
      await applySQLiteMigrations(database, currentVersion);
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
