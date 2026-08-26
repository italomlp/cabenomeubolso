import { describe, expect, it, jest } from '@jest/globals';

import type { ShoppingList } from '@/domain/shopping-list';

import {
  DEV_SCREENSHOT_RESET_URL,
  DEV_SCREENSHOT_HOME_PATH,
  handleDevScreenshotDeepLink,
  isDevScreenshotResetUrl,
  redirectDevScreenshotSystemPath,
  resetAndSeedDevScreenshotData,
  resetAndSeedDevScreenshotDataForRepository,
} from './screenshot-harness';

describe('development screenshot harness', () => {
  it('recognizes only the deterministic reset deep link', () => {
    expect(isDevScreenshotResetUrl(DEV_SCREENSHOT_RESET_URL)).toBe(true);
    expect(isDevScreenshotResetUrl(`${DEV_SCREENSHOT_RESET_URL}?run=1`)).toBe(true);
    expect(isDevScreenshotResetUrl('dev/reset-seed')).toBe(true);
    expect(isDevScreenshotResetUrl('cabenomeubolso://list/new')).toBe(false);
  });

  it('consumes the reset path before Expo Router can route it', async () => {
    const handleDeepLink = jest.fn(async () => true);

    await expect(redirectDevScreenshotSystemPath('dev/reset-seed', handleDeepLink)).resolves.toBe(DEV_SCREENSHOT_HOME_PATH);
    expect(handleDeepLink).toHaveBeenCalledWith('dev/reset-seed');
  });

  it('invokes the reset and seed operation when consuming the reset link', async () => {
    const resetAndSeed = jest.fn(async () => true);

    await expect(handleDevScreenshotDeepLink(DEV_SCREENSHOT_RESET_URL, resetAndSeed)).resolves.toBe(true);
    expect(resetAndSeed).toHaveBeenCalledTimes(1);
  });

  it('does not consume the reset link when the injected seed operation is unavailable', async () => {
    const resetAndSeed = jest.fn(async () => false);

    await expect(handleDevScreenshotDeepLink(DEV_SCREENSHOT_RESET_URL, resetAndSeed)).resolves.toBe(false);
    expect(resetAndSeed).toHaveBeenCalledTimes(1);
  });

  it('resets through the repository and saves the supplied seed in order', async () => {
    const savedIds: string[] = [];
    const repository = {
      resetForDevelopment: jest.fn(async () => undefined),
      save: jest.fn(async (list: ShoppingList) => {
        savedIds.push(list.id);
      }),
    };
    const seed = [{ id: 'first' }, { id: 'second' }] as unknown as readonly ShoppingList[];

    await resetAndSeedDevScreenshotDataForRepository(repository, seed);

    expect(repository.resetForDevelopment).toHaveBeenCalledTimes(1);
    expect(savedIds).toEqual(['first', 'second']);
  });

  it('wires the native reset operation to the bootstrapped database repository', async () => {
    const repository = {
      resetForDevelopment: jest.fn(async () => undefined),
      save: jest.fn(async () => undefined),
    };
    const ensureDatabase = jest.fn(async () => ({ database: true }));
    const createRepository = jest.fn(() => repository);

    await expect(resetAndSeedDevScreenshotData({ ensureDatabase, createRepository })).resolves.toBe(true);

    expect(ensureDatabase).toHaveBeenCalledTimes(1);
    expect(createRepository).toHaveBeenCalledWith({ database: true });
    expect(repository.resetForDevelopment).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'dev-screenshot-list' }));
  });

  it('ignores non-harness deep links', async () => {
    await expect(handleDevScreenshotDeepLink('cabenomeubolso://list/new')).resolves.toBe(false);
  });
});
