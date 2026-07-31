import { DEFAULT_LANGUAGE, type SupportedLanguage } from './resources';

export type SupportedCurrency = 'BRL' | 'USD';

export type LanguagePreference = 'system' | SupportedLanguage;

export type CurrencyPreference = 'system' | SupportedCurrency;

export type LocaleLike = {
  currencyCode?: string | null;
  languageCode?: string | null;
  languageTag?: string | null;
  regionCode?: string | null;
};

export type LocalizationPreferences = {
  currencyPreference: CurrencyPreference;
  languagePreference: LanguagePreference;
};

const REGION_TO_CURRENCY: Readonly<Record<string, SupportedCurrency>> = {
  BR: 'BRL',
  US: 'USD',
};

const SUPPORTED_CURRENCIES = new Set<SupportedCurrency>(['BRL', 'USD']);

function resolveLanguageFromLocale(locale: LocaleLike): SupportedLanguage | null {
  const language = (locale.languageTag ?? locale.languageCode ?? '').toLowerCase();

  if (language.startsWith('pt')) {
    return 'pt-BR';
  }

  if (language.startsWith('en')) {
    return 'en';
  }

  return null;
}

function resolveCurrencyFromLocale(locale: LocaleLike): SupportedCurrency | null {
  const currencyCode = locale.currencyCode?.toUpperCase();

  if (currencyCode !== undefined && SUPPORTED_CURRENCIES.has(currencyCode as SupportedCurrency)) {
    return currencyCode as SupportedCurrency;
  }

  const regionCode = locale.regionCode?.toUpperCase();

  return regionCode ? REGION_TO_CURRENCY[regionCode] ?? null : null;
}

export function resolveLanguagePreference(
  languagePreference: LanguagePreference,
  locales: readonly LocaleLike[]
): SupportedLanguage {
  if (languagePreference !== 'system') {
    return languagePreference;
  }

  for (const locale of locales) {
    const resolvedLanguage = resolveLanguageFromLocale(locale);

    if (resolvedLanguage !== null) {
      return resolvedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function resolveDefaultCurrency(
  currencyPreference: CurrencyPreference,
  locales: readonly LocaleLike[]
): SupportedCurrency {
  if (currencyPreference !== 'system') {
    return currencyPreference;
  }

  for (const locale of locales) {
    const resolvedCurrency = resolveCurrencyFromLocale(locale);

    if (resolvedCurrency !== null) {
      return resolvedCurrency;
    }
  }

  return 'BRL';
}

export function resolveLocalizationPreferences(
  preferences: LocalizationPreferences,
  locales: readonly LocaleLike[]
) {
  return {
    currency: resolveDefaultCurrency(preferences.currencyPreference, locales),
    language: resolveLanguagePreference(preferences.languagePreference, locales),
  };
}
