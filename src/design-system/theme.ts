import type { ThemeMode, ThemePreference } from '@/stores/theme-preferences';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/lib/localization/resources';

export type SemanticColorTokens = {
  surface: string;
  surfaceRaised: string;
  onSurface: string;
  muted: string;
  placeholder: string;
  border: string;
  focus: string;
  budgetSafe: string;
  budgetRisk: string;
  budgetNeutral: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  text: string;
  textSecondary: string;
};

export type SemanticTypographyTokens = {
  body: { fontSize: number; lineHeight: number; fontWeight: '400' | '500' | '600' | '700' };
  label: { fontSize: number; lineHeight: number; fontWeight: '500' | '600' | '700' };
  title: { fontSize: number; lineHeight: number; fontWeight: '600' | '700' };
  display: { fontSize: number; lineHeight: number; fontWeight: '700' };
  numeric: { fontSize: number; lineHeight: number; fontWeight: '500' | '600' | '700'; fontVariant: ['tabular-nums'] };
};

export type SemanticSpaceTokens = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  content: number;
  touchTarget: number;
  contentMax: number;
};

export type SemanticRadiusTokens = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
};

export type SemanticMotionTokens = {
  none: number;
  fast: number;
  standard: number;
  slow: number;
};

export type SemanticTheme = {
  mode: ThemeMode;
  colors: SemanticColorTokens;
  typography: SemanticTypographyTokens;
  space: SemanticSpaceTokens;
  radius: SemanticRadiusTokens;
  motion: SemanticMotionTokens;
};

export type SemanticThemePreference = ThemePreference;

export type LocaleLike = {
  currencyCode?: string | null;
  languageCode?: string | null;
  languageTag?: string | null;
  regionCode?: string | null;
};

const SHARED_TYPOGRAPHY: Omit<SemanticTheme, 'mode' | 'colors'>['typography'] = {
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  numeric: { fontSize: 16, lineHeight: 24, fontWeight: '600', fontVariant: ['tabular-nums'] },
};

const SHARED_SPACE: Omit<SemanticTheme, 'mode' | 'colors' | 'typography'>['space'] = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  content: 24,
  touchTarget: 44,
  contentMax: 800,
};

const SHARED_RADIUS: Omit<SemanticTheme, 'mode' | 'colors' | 'typography' | 'space'>['radius'] = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

const SHARED_MOTION: Omit<SemanticTheme, 'mode' | 'colors' | 'typography' | 'space' | 'radius'>['motion'] = {
  none: 0,
  fast: 120,
  standard: 200,
  slow: 280,
};

const LIGHT_COLORS: SemanticColorTokens = {
  surface: '#FFFDF8',
  surfaceRaised: '#FFF9EF',
  onSurface: '#1D2B28',
  muted: '#596560',
  placeholder: '#7C8882',
  border: '#E4DED2',
  focus: '#087F73',
  budgetSafe: '#087F73',
  budgetRisk: '#B94D3C',
  budgetNeutral: '#74807A',
  background: '#FFFDF8',
  backgroundElement: '#F7F1E7',
  backgroundSelected: '#DDF1EC',
  text: '#1D2B28',
  textSecondary: '#596560',
};

const DARK_COLORS: SemanticColorTokens = {
  surface: '#14201E',
  surfaceRaised: '#1C2B28',
  onSurface: '#F4F0E8',
  muted: '#B5C1BA',
  placeholder: '#8FA29A',
  border: '#364943',
  focus: '#54C5B5',
  budgetSafe: '#54C5B5',
  budgetRisk: '#F07A66',
  budgetNeutral: '#A4B2AA',
  background: '#0E1816',
  backgroundElement: '#20302C',
  backgroundSelected: '#234943',
  text: '#F4F0E8',
  textSecondary: '#B5C1BA',
};

const createSemanticTheme = (mode: ThemeMode, colors: SemanticColorTokens): SemanticTheme => ({
  mode,
  colors,
  typography: SHARED_TYPOGRAPHY,
  space: SHARED_SPACE,
  radius: SHARED_RADIUS,
  motion: SHARED_MOTION,
});

export const semanticThemes = {
  dark: createSemanticTheme('dark', DARK_COLORS),
  light: createSemanticTheme('light', LIGHT_COLORS),
} as const;

export function resolveThemeMode(
  themePreference: SemanticThemePreference,
  systemScheme: ThemeMode | 'unspecified' | null | undefined
): ThemeMode {
  if (themePreference !== 'system') {
    return themePreference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function resolveSemanticTheme(
  themePreference: SemanticThemePreference,
  systemScheme: ThemeMode | 'unspecified' | null | undefined
): SemanticTheme {
  const mode = resolveThemeMode(themePreference, systemScheme);

  return semanticThemes[mode];
}

export const DEFAULT_SEMANTIC_LANGUAGE: SupportedLanguage = DEFAULT_LANGUAGE;
