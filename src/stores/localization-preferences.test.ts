import { describe, expect, it, jest } from '@jest/globals';

describe('localization preferences store', () => {
  it('hydrates saved localization preferences without overwriting explicit currency selection', async () => {
    const getItem = jest.fn<(key: string) => Promise<string | null>>().mockResolvedValue(
      JSON.stringify({
        state: { currencyPreference: 'USD', languagePreference: 'pt-BR' },
        version: 1,
      })
    );
    const setItem = jest.fn<(key: string, value: string) => Promise<void>>().mockResolvedValue(undefined);
    const removeItem = jest.fn<(key: string) => Promise<void>>().mockResolvedValue(undefined);

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: { getItem, setItem, removeItem },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useLocalizationPreferencesStore } = require('./localization-preferences') as typeof import('./localization-preferences');

    await useLocalizationPreferencesStore.persist.rehydrate();

    expect(useLocalizationPreferencesStore.getState().languagePreference).toBe('pt-BR');
    expect(useLocalizationPreferencesStore.getState().currencyPreference).toBe('USD');

    useLocalizationPreferencesStore.getState().setCurrencyPreference('USD');

    expect(useLocalizationPreferencesStore.getState().currencyPreference).toBe('USD');
  });
});
