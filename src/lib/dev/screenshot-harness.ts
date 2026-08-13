import type { ShoppingList } from '@/domain/shopping-list';
import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import {
  createSQLiteShoppingListRepository,
  type SQLiteShoppingListRepository,
} from '@/lib/sqlite/shopping-list-repository';

import { DEV_SCREENSHOT_SEED } from './screenshot-seed';

export const DEV_SCREENSHOT_RESET_URL = 'cabenomeubolso://dev/reset-seed';
const DEV_SCREENSHOT_RESET_PATH = 'dev/reset-seed';

export type DevScreenshotRepository = Pick<SQLiteShoppingListRepository, 'resetForDevelopment' | 'save'>;

export function isDevScreenshotResetUrl(url: string): boolean {
  const path = url.split(/[?#]/, 1)[0];
  return path === DEV_SCREENSHOT_RESET_URL || path === DEV_SCREENSHOT_RESET_PATH || path === `/${DEV_SCREENSHOT_RESET_PATH}`;
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

/**
 * Consume the reset link before Expo Router tries to resolve it as a route.
 * The injected handler keeps this boundary deterministic in unit tests.
 */
export async function redirectDevScreenshotSystemPath(
  path: string,
  handleDeepLink: (url: string) => Promise<boolean> = handleDevScreenshotDeepLink
): Promise<string> {
  if (!__DEV__ || !isDevScreenshotResetUrl(path)) {
    return path;
  }

  const consumed = await handleDeepLink(path);
  return consumed ? '/' : path;
}
