import type { ShoppingList } from '@/domain/shopping-list';
import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import {
  createSQLiteShoppingListRepository,
  type SQLiteShoppingListRepository,
} from '@/lib/sqlite/shopping-list-repository';

import { DEV_SCREENSHOT_SEED } from './screenshot-seed';

export const DEV_SCREENSHOT_RESET_URL = 'cabenomeubolso://dev/reset-seed';
const DEV_SCREENSHOT_RESET_PATH = 'dev/reset-seed';
export const DEV_SCREENSHOT_HOME_PATH = '/(tabs)/home';

export type DevScreenshotRepository = Pick<SQLiteShoppingListRepository, 'resetForDevelopment' | 'save'>;
export type DevScreenshotResetter = () => Promise<boolean>;
export type DevScreenshotDataDependencies = {
  ensureDatabase?: () => Promise<unknown>;
  createRepository?: (database: unknown) => DevScreenshotRepository;
};

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

export async function resetAndSeedDevScreenshotData(
  dependencies: DevScreenshotDataDependencies = {}
): Promise<boolean> {
  if (!__DEV__) {
    return false;
  }

  const database = await (dependencies.ensureDatabase ?? ensureSQLiteBootstrapped)();
  const repository = (dependencies.createRepository ?? ((value: unknown) =>
    createSQLiteShoppingListRepository(value as never)))(database);
  await resetAndSeedDevScreenshotDataForRepository(repository);
  return true;
}

export async function handleDevScreenshotDeepLink(
  url: string,
  resetAndSeed: DevScreenshotResetter = resetAndSeedDevScreenshotData
): Promise<boolean> {
  if (!__DEV__ || !isDevScreenshotResetUrl(url)) {
    return false;
  }

  return resetAndSeed();
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
  return consumed ? DEV_SCREENSHOT_HOME_PATH : path;
}
