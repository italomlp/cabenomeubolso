import { describe, expect, it, jest } from '@jest/globals';

import { SQLITE_DATABASE_VERSION, applySQLiteMigrations } from './migrations';

type MockSQLiteDatabase = {
  execAsync: jest.MockedFunction<(sql: string) => Promise<void>>;
  withTransactionAsync: (task: () => Promise<void>) => Promise<void>;
};

describe('applySQLiteMigrations', () => {
  it('updates user_version inside the migration transaction', async () => {
    const execAsync: MockSQLiteDatabase['execAsync'] = jest
      .fn<(sql: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => {
      await task();
    });
    const database = {
      execAsync,
      withTransactionAsync,
    } as unknown as MockSQLiteDatabase;

    await applySQLiteMigrations(database as never, 0);

    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
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
});
