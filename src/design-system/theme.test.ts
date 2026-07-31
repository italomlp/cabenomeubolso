import { describe, expect, it } from '@jest/globals';

import { resolveSemanticTheme, resolveThemeMode, semanticThemes } from './theme';

describe('semantic theme resolver', () => {
  it('resolves system, light, and dark modes deterministically', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', 'unspecified')).toBe('light');
  });

  it('returns semantic token sets for both modes', () => {
    expect(resolveSemanticTheme('light', 'dark')).toEqual(semanticThemes.light);
    expect(resolveSemanticTheme('system', 'dark')).toEqual(semanticThemes.dark);
  });
});
