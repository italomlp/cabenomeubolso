import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingListUnitCode } from '@/domain/shopping-list';

const QUANTITY_SCALE = 1000n;
const CURRENCY_SCALE = 100n;

const UNIT_FRACTION_DIGITS: Readonly<Record<ShoppingListUnitCode, 0 | 3>> = {
  g: 0,
  kg: 3,
  l: 3,
  ml: 0,
  pack: 0,
  piece: 0,
};

export type LocaleInputParseErrorCode = 'ambiguous' | 'empty' | 'invalid' | 'nonPositive' | 'precision' | 'unsafe';

export class LocaleInputParseError extends Error {
  public readonly code: LocaleInputParseErrorCode;

  constructor(code: LocaleInputParseErrorCode, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.name = 'LocaleInputParseError';
  }
}

type LocaleSymbols = {
  currencyTokens: readonly string[];
  decimalSeparator: string;
  groupSeparator: string;
  numberTokens: readonly string[];
};

type ParseScaledInputOptions = {
  locale: string;
  maxFractionDigits: 0 | 2 | 3;
  minimumValue: bigint;
  resultScale: bigint;
  currencyCode?: SupportedCurrency;
};

const localeSymbolsCache = new Map<string, LocaleSymbols>();

function getLocaleSymbols(locale: string, currencyCode?: SupportedCurrency): LocaleSymbols {
  const cacheKey = `${locale}:${currencyCode ?? ''}`;
  const cached = localeSymbolsCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const numberParts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const currencyParts = currencyCode
    ? new Intl.NumberFormat(locale, { currency: currencyCode, style: 'currency' }).formatToParts(12345.6)
    : [];

  const decimalSeparator = numberParts.find((part) => part.type === 'decimal')?.value ?? '.';
  const groupSeparator = numberParts.find((part) => part.type === 'group')?.value ?? ',';

  const currencyTokens = Array.from(
    new Set(currencyParts.filter((part) => part.type === 'currency' || part.type === 'literal').map((part) => part.value))
  );
  const numberTokens = Array.from(new Set(numberParts.filter((part) => part.type === 'literal').map((part) => part.value)));

  const symbols = {
    currencyTokens,
    decimalSeparator,
    groupSeparator,
    numberTokens,
  } satisfies LocaleSymbols;

  localeSymbolsCache.set(cacheKey, symbols);

  return symbols;
}

function stripLocaleDecorations(text: string, locale: string, currencyCode?: SupportedCurrency): string {
  let normalized = text.normalize('NFKC').trim();

  const symbols = getLocaleSymbols(locale, currencyCode);

  for (const token of [...symbols.currencyTokens, ...symbols.numberTokens]) {
    if (token.length > 0) {
      normalized = normalized.split(token).join('');
    }
  }

  return normalized.replace(/\p{White_Space}+/gu, '');
}

function toScaledInteger(integerDigits: string, fractionDigits: string, options: ParseScaledInputOptions): number {
  const decimalScale = options.maxFractionDigits === 0 ? 1n : 10n ** BigInt(options.maxFractionDigits);

  if (options.resultScale % decimalScale !== 0n) {
    throw new Error('Locale number scale is not compatible with the requested precision.');
  }

  const fractionFactor = options.resultScale / decimalScale;
  const integerComponent = integerDigits.length === 0 ? 0n : BigInt(integerDigits);
  const fractionComponent =
    fractionDigits.length === 0 ? 0n : BigInt(fractionDigits.padEnd(options.maxFractionDigits, '0')) * fractionFactor;
  const value = integerComponent * options.resultScale + fractionComponent;

  if (value < options.minimumValue) {
    throw new LocaleInputParseError('nonPositive', 'Value must be greater than zero.');
  }

  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new LocaleInputParseError('unsafe', 'Value is too large.');
  }

  return Number(value);
}

function parseScaledInput(text: string, options: ParseScaledInputOptions): number {
  const cleaned = stripLocaleDecorations(text, options.locale, options.currencyCode);

  if (cleaned.length === 0) {
    throw new LocaleInputParseError('empty', 'Value is required.');
  }

  const symbols = getLocaleSymbols(options.locale, options.currencyCode);

  for (const character of cleaned) {
    if (/\d/u.test(character) || character === symbols.decimalSeparator || character === symbols.groupSeparator) {
      continue;
    }

    throw new LocaleInputParseError('ambiguous', 'Use the locale separators only.');
  }

  const decimalSeparatorCount = cleaned.split(symbols.decimalSeparator).length - 1;

  if (decimalSeparatorCount > 1) {
    throw new LocaleInputParseError('ambiguous', 'Use a single decimal separator.');
  }

  const [integerPartRaw, fractionPartRaw = ''] = cleaned.split(symbols.decimalSeparator);

  if (fractionPartRaw.includes(symbols.groupSeparator)) {
    throw new LocaleInputParseError('ambiguous', 'Use a single decimal separator.');
  }

  if (fractionPartRaw.length > options.maxFractionDigits) {
    throw new LocaleInputParseError('precision', 'Too many decimal places.');
  }

  if (options.maxFractionDigits === 0 && fractionPartRaw.length > 0) {
    throw new LocaleInputParseError('precision', 'This unit requires a whole number.');
  }

  let integerDigits = integerPartRaw;

  if (integerPartRaw.includes(symbols.groupSeparator)) {
    const groups = integerPartRaw.split(symbols.groupSeparator);

    if (groups.some((group) => group.length === 0)) {
      throw new LocaleInputParseError('ambiguous', 'Use locale grouping only in the integer part.');
    }

    if (groups[0].length < 1 || groups[0].length > 3 || groups.slice(1).some((group) => group.length !== 3)) {
      throw new LocaleInputParseError('ambiguous', 'Use locale grouping only in the integer part.');
    }

    integerDigits = groups.join('');
  }

  if (!/^\d*$/.test(integerDigits) || !/^\d*$/.test(fractionPartRaw)) {
    throw new LocaleInputParseError('invalid', 'Use digits only.');
  }

  if (integerDigits.length === 0 && fractionPartRaw.length === 0) {
    throw new LocaleInputParseError('empty', 'Value is required.');
  }

  if (integerDigits.length === 0) {
    integerDigits = '0';
  }

  return toScaledInteger(integerDigits, fractionPartRaw, options);
}

export function formatCurrencyMinor(locale: string, minorUnits: number, currencyCode: SupportedCurrency): string {
  if (!Number.isSafeInteger(minorUnits) || minorUnits < 0) {
    throw new RangeError('Currency minor units must be a non-negative safe integer.');
  }

  return new Intl.NumberFormat(locale, { currency: currencyCode, style: 'currency' }).format(minorUnits / 100);
}

export function formatQuantityMilli(locale: string, unitCode: ShoppingListUnitCode, quantityMilli: number): string {
  if (!Number.isSafeInteger(quantityMilli) || quantityMilli < 0) {
    throw new RangeError('Quantity milli must be a non-negative safe integer.');
  }

  const fractionDigits = UNIT_FRACTION_DIGITS[unitCode];

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(quantityMilli / 1000);
}

export function parseCurrencyMinor(locale: string, text: string, currencyCode: SupportedCurrency): number {
  return parseScaledInput(text, {
    currencyCode,
    locale,
    maxFractionDigits: 2,
    minimumValue: 0n,
    resultScale: CURRENCY_SCALE,
  });
}

export function parseQuantityMilli(locale: string, text: string, unitCode: ShoppingListUnitCode): number {
  return parseScaledInput(text, {
    locale,
    maxFractionDigits: UNIT_FRACTION_DIGITS[unitCode],
    minimumValue: 1n,
    resultScale: QUANTITY_SCALE,
  });
}
