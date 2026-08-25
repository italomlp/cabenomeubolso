import { describe, expect, it, jest } from '@jest/globals';

import { createSQLiteBootstrap, type SQLiteBootstrapDependencies } from './bootstrap';

type MockSQLiteDatabase = {
  execAsync: jest.MockedFunction<(sql: string) => Promise<void>>;
  getFirstAsync: jest.MockedFunction<(
    sql: string
  ) => Promise<{ user_version: number } | undefined>>;
  runAsync?: jest.MockedFunction<(sql: string, ...params: readonly unknown[]) => Promise<unknown>>;
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

  it('runs launch trash cleanup through the ISO repository cutoff', async () => {
    const execAsync = jest.fn(async () => undefined);
    const getFirstAsync = jest.fn(async () => ({ user_version: 3 }));
    const runAsync = jest.fn<(sql: string, ...params: readonly unknown[]) => Promise<unknown>>(
      async () => undefined
    );
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => {
      await task();
    });
    const openDatabaseAsync = jest.fn(async () => ({
      execAsync,
      getAllAsync: jest.fn(async () => []),
      getFirstAsync,
      runAsync,
      withTransactionAsync,
    }));
    const bootstrap = createSQLiteBootstrap({
      openDatabaseAsync: openDatabaseAsync as unknown as SQLiteBootstrapDependencies['openDatabaseAsync'],
    });

    await bootstrap.ensureBootstrapped();

    expect(runAsync).toHaveBeenCalledTimes(3);
    for (const [sql, cutoff] of runAsync.mock.calls) {
      expect(sql).toContain('deleted_at <= ?');
      expect(sql).not.toContain('datetime(');
      expect(cutoff).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/));
    }
  });
});
