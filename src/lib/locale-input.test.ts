import { describe, expect, it } from '@jest/globals';

import {
  formatCurrencyMinor,
  formatQuantityMilli,
  LocaleInputParseError,
  parseCurrencyMinor,
  parseQuantityMilli,
} from './locale-input';

describe('locale input boundary', () => {
  it('parses pt-BR and en quantity input using the active locale separators', () => {
    expect(parseQuantityMilli('pt-BR', '1,5', 'kg')).toBe(1500);
    expect(parseQuantityMilli('en', '1.5', 'kg')).toBe(1500);
    expect(formatQuantityMilli('pt-BR', 'kg', 1500)).toBe('1,5');
    expect(formatQuantityMilli('en', 'kg', 1500)).toBe('1.5');
  });

  it('rejects unsupported precision for integer-only units', () => {
    try {
      parseQuantityMilli('pt-BR', '1,5', 'piece');
      throw new Error('expected parse to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(LocaleInputParseError);
      expect((error as LocaleInputParseError).code).toBe('precision');
    }
  });

  it('formats and parses localized currency values without losing minor units', () => {
    expect(formatCurrencyMinor('pt-BR', 123_456, 'BRL')).toBe('R$\u00a01.234,56');
    expect(formatCurrencyMinor('en', 123_456, 'USD')).toBe('$1,234.56');
    expect(parseCurrencyMinor('pt-BR', 'R$ 1.234,56', 'BRL')).toBe(123_456);
    expect(parseCurrencyMinor('en', '$1,234.56', 'USD')).toBe(123_456);
  });
});
