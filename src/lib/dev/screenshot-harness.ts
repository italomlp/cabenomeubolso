import type { ShoppingList } from '@/domain/shopping-list';
import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import {
  createSQLiteShoppingListRepository,
  type SQLiteShoppingListRepository,
} from '@/lib/sqlite/shopping-list-repository';

import { DEV_SCREENSHOT_SEED } from './screenshot-seed';

export const DEV_SCREENSHOT_RESET_URL = 'cabenomeubolso://dev/reset-seed';

export type DevScreenshotRepository = Pick<SQLiteShoppingListRepository, 'resetForDevelopment' | 'save'>;

export function isDevScreenshotResetUrl(url: string): boolean {
  return url.split('?')[0] === DEV_SCREENSHOT_RESET_URL;
}

export async function resetAndSeedDevScreenshotDataForRepository(
  repository: DevScreenshotRepository,
  seed: readonly ShoppingList[] = DEV_SCREENSHOT_SEED
): Promise<void> {
  if (!__DEV__) {
    return;
  }

  await repository.resetForDevelopment();

  for (const list of seed) {
    await repository.save(list);
  }
}

export async function resetAndSeedDevScreenshotData(): Promise<boolean> {
  if (!__DEV__) {
    return false;
  }

  const database = await ensureSQLiteBootstrapped();
  const repository = createSQLiteShoppingListRepository(database as never);
  await resetAndSeedDevScreenshotDataForRepository(repository);
  return true;
}

export async function handleDevScreenshotDeepLink(url: string): Promise<boolean> {
  if (!__DEV__ || !isDevScreenshotResetUrl(url)) {
    return false;
  }

  await resetAndSeedDevScreenshotData();
  return true;
}
