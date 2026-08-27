import { describe, expect, it } from '@jest/globals';

import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingListUnitCode } from '@/domain/shopping-list';
import {
  formatCurrencyMinor,
  formatQuantityMilli,
  parseCurrencyMinor,
  parseQuantityMilli,
} from '@/lib/locale-input';
import { resolveCreateListCurrency } from '@/app/home-state';
import { resolveLocalizationPreferences } from '@/lib/localization/resolution';

const locales = ['pt-BR', 'en'] as const;
const currencies: readonly SupportedCurrency[] = ['BRL', 'USD'];

const quantities: readonly { unit: ShoppingListUnitCode; milli: number }[] = [
  { unit: 'piece', milli: 2_000 },
  { unit: 'pack', milli: 3_000 },
  { unit: 'kg', milli: 1_500 },
  { unit: 'g', milli: 500_000 },
  { unit: 'l', milli: 1_250 },
  { unit: 'ml', milli: 750_000 },
];

describe('Epic 9 locale and currency regression matrix', () => {
  it.each(locales)('round-trips every supported unit category in %s', (locale) => {
    for (const { unit, milli } of quantities) {
      const formatted = formatQuantityMilli(locale, unit, milli);

      expect(parseQuantityMilli(locale, formatted, unit)).toBe(milli);
    }
  });

  it.each(locales.flatMap((locale) => currencies.map((currency) => [locale, currency] as const)))
    ('round-trips %s display input for an explicit %s list currency', (locale, currency) => {
      const formatted = formatCurrencyMinor(locale, 123_456, currency);

      expect(parseCurrencyMinor(locale, formatted, currency)).toBe(123_456);
    });

  it.each(currencies)('keeps an explicit %s currency independent from language', (currency) => {
    expect(
      resolveCreateListCurrency(
        { currencyPreference: currency, languagePreference: 'pt-BR' },
        [{ languageTag: 'en-US', regionCode: 'US', currencyCode: 'USD' }]
      )
    ).toBe(currency);

    expect(
      resolveCreateListCurrency(
        { currencyPreference: currency, languagePreference: 'en' },
        [{ languageTag: 'pt-BR', regionCode: 'BR', currencyCode: 'BRL' }]
      )
    ).toBe(currency);
  });

  it('resolves BRL from an en-US language tag with a fixed BR region', () => {
    const locales = [{ languageTag: 'en-US', regionCode: 'BR' }];

    expect(resolveCreateListCurrency({ currencyPreference: 'system', languagePreference: 'system' }, locales)).toBe('BRL');
    expect(resolveLocalizationPreferences({ currencyPreference: 'system', languagePreference: 'system' }, locales)).toEqual({
      currency: 'BRL',
      language: 'en',
    });

    expect(resolveCreateListCurrency({ currencyPreference: 'system', languagePreference: 'pt-BR' }, locales)).toBe('BRL');
  });

  it('does not infer currency from language when the fixed region changes', () => {
    expect(
      resolveCreateListCurrency(
        { currencyPreference: 'system', languagePreference: 'pt-BR' },
        [{ languageTag: 'pt-BR', regionCode: 'US' }]
      )
    ).toBe('USD');
  });

  it.each(['piece', 'pack', 'g', 'ml'] as const)('rejects fractional input for whole unit %s in both locales', (unit) => {
    for (const locale of locales) {
      expect(() => parseQuantityMilli(locale, locale === 'pt-BR' ? '1,5' : '1.5', unit)).toThrow();
    }
  });
});
