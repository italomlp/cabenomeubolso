import type { SQLiteDatabase } from 'expo-sqlite';

export const SQLITE_DATABASE_VERSION = 1;

export type SQLiteMigration = {
  version: number;
  up: (database: SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: readonly SQLiteMigration[] = [
  {
    version: 1,
    up: async () => undefined,
  },
];

export async function applySQLiteMigrations(database: SQLiteDatabase, currentVersion: number) {
  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await migration.up(database);
  }
}
