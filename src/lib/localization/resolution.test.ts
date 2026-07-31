import { describe, expect, it } from '@jest/globals';

import {
  resolveDefaultCurrency,
  resolveLanguagePreference,
  resolveLocalizationPreferences,
} from './resolution';

describe('localization resolution', () => {
  it('prefers a saved language override before device language and English fallback', () => {
    expect(
      resolveLanguagePreference('pt-BR', [{ languageTag: 'en-US', regionCode: 'US' }])
    ).toBe('pt-BR');
    expect(resolveLanguagePreference('system', [{ languageTag: 'pt-PT' }])).toBe('pt-BR');
    expect(resolveLanguagePreference('system', [{ languageTag: 'fr-FR' }])).toBe('en');
  });

  it('resolves currency from currencyCode before region and BRL fallback', () => {
    expect(resolveDefaultCurrency('system', [{ currencyCode: 'USD', regionCode: 'BR' }])).toBe('USD');
    expect(resolveDefaultCurrency('system', [{ currencyCode: 'EUR', regionCode: 'US' }])).toBe('USD');
    expect(resolveDefaultCurrency('system', [{ regionCode: 'BR' }])).toBe('BRL');
    expect(resolveDefaultCurrency('BRL', [{ currencyCode: 'USD', regionCode: 'US' }])).toBe('BRL');
  });

  it('resolves language and currency together without mutating the inputs', () => {
    const locales = Object.freeze([{ languageTag: 'en-GB', regionCode: 'US' }]);
    const resolved = resolveLocalizationPreferences(
      { currencyPreference: 'system', languagePreference: 'system' },
      locales
    );

    expect(resolved).toEqual({ currency: 'USD', language: 'en' });
    expect(locales).toEqual([{ languageTag: 'en-GB', regionCode: 'US' }]);
  });
});
