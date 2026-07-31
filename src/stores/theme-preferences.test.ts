import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { act } from 'react-test-renderer';

describe('theme preferences store', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('restores persisted theme mode from AsyncStorage', async () => {
    const getItem = jest.fn<(key: string) => Promise<string>>().mockResolvedValue(
      JSON.stringify({ state: { themePreference: 'dark' }, version: 0 })
    );
    const setItem = jest.fn<(key: string, value: string) => Promise<void>>().mockResolvedValue(undefined);
    const removeItem = jest.fn<(key: string) => Promise<void>>().mockResolvedValue(undefined);

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: { getItem, setItem, removeItem },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { resolveThemeMode, useThemePreferencesStore } = require('./theme-preferences') as typeof import('./theme-preferences');

    await useThemePreferencesStore.persist.rehydrate();

    expect(useThemePreferencesStore.getState().themePreference).toBe('dark');
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
  });

  it('persists theme changes through AsyncStorage', async () => {
    const getItem = jest.fn<(key: string) => Promise<null>>().mockResolvedValue(null);
    const setItem = jest.fn<(key: string, value: string) => Promise<void>>().mockResolvedValue(undefined);
    const removeItem = jest.fn<(key: string) => Promise<void>>().mockResolvedValue(undefined);

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: { getItem, setItem, removeItem },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { THEME_PREFERENCES_STORAGE_KEY, useThemePreferencesStore } = require(
      './theme-preferences'
    ) as typeof import('./theme-preferences');

    await act(async () => {
      useThemePreferencesStore.getState().setThemePreference('light');
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(setItem).toHaveBeenCalledWith(
      THEME_PREFERENCES_STORAGE_KEY,
      expect.stringContaining('"themePreference":"light"')
    );
  });
});
