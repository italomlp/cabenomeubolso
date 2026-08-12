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
  surface: '#FFFFFF',
  surfaceRaised: '#F5F7FA',
  onSurface: '#172B4D',
  muted: '#44546F',
  placeholder: '#6B7A99',
  border: '#D7DFEA',
  focus: '#208AEF',
  budgetSafe: '#2E7D32',
  budgetRisk: '#C62828',
  budgetNeutral: '#5C6B8A',
  background: '#FFFFFF',
  backgroundElement: '#F0F4F8',
  backgroundSelected: '#E6EEF8',
  text: '#172B4D',
  textSecondary: '#44546F',
};

const DARK_COLORS: SemanticColorTokens = {
  surface: '#111827',
  surfaceRaised: '#1F2937',
  onSurface: '#F3F4F6',
  muted: '#C7D2E0',
  placeholder: '#93A4BB',
  border: '#334155',
  focus: '#66B2FF',
  budgetSafe: '#4CAF50',
  budgetRisk: '#EF5350',
  budgetNeutral: '#94A3B8',
  background: '#0B1220',
  backgroundElement: '#162033',
  backgroundSelected: '#1E3A5F',
  text: '#F3F4F6',
  textSecondary: '#C7D2E0',
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
