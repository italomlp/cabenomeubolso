import { describe, expect, it, jest } from '@jest/globals';

import { createSQLiteBootstrap, type SQLiteBootstrapDependencies } from './bootstrap';

type MockSQLiteDatabase = {
  execAsync: jest.MockedFunction<(sql: string) => Promise<void>>;
  getFirstAsync: jest.MockedFunction<(
    sql: string
  ) => Promise<{ user_version: number } | undefined>>;
  withTransactionAsync: (task: () => Promise<void>) => Promise<void>;
};

describe('createSQLiteBootstrap', () => {
  it('boots SQLite only once and applies migrations inside a transaction', async () => {
    const execAsync: MockSQLiteDatabase['execAsync'] = jest
      .fn<(sql: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    const getFirstAsync: MockSQLiteDatabase['getFirstAsync'] = jest
      .fn<(sql: string) => Promise<{ user_version: number } | undefined>>()
      .mockResolvedValue({ user_version: 0 });
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => {
      await task();
    });
    const openDatabaseAsync = jest
      .fn<() => Promise<MockSQLiteDatabase>>()
      .mockResolvedValue({ execAsync, getFirstAsync, withTransactionAsync });
    const bootstrap = createSQLiteBootstrap({
      openDatabaseAsync: openDatabaseAsync as unknown as SQLiteBootstrapDependencies['openDatabaseAsync'],
    });

    await bootstrap.ensureBootstrapped();
    await bootstrap.ensureBootstrapped();

    expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(getFirstAsync).toHaveBeenCalledTimes(1);
    expect(execAsync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL;');
    expect(execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(execAsync).toHaveBeenCalledWith('PRAGMA user_version = 3;');
  });
});
