import { describe, expect, it, jest } from '@jest/globals';

import type { ShoppingList } from '@/domain/shopping-list';

import {
  DEV_SCREENSHOT_RESET_URL,
  handleDevScreenshotDeepLink,
  isDevScreenshotResetUrl,
  resetAndSeedDevScreenshotDataForRepository,
} from './screenshot-harness';

describe('development screenshot harness', () => {
  it('recognizes only the deterministic reset deep link', () => {
    expect(isDevScreenshotResetUrl(DEV_SCREENSHOT_RESET_URL)).toBe(true);
    expect(isDevScreenshotResetUrl(`${DEV_SCREENSHOT_RESET_URL}?run=1`)).toBe(true);
    expect(isDevScreenshotResetUrl('cabenomeubolso://list/new')).toBe(false);
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

  it('ignores non-harness deep links', async () => {
    await expect(handleDevScreenshotDeepLink('cabenomeubolso://list/new')).resolves.toBe(false);
  });
});
