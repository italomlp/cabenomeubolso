import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { ThemeMode, ThemePreference } from '@/stores/theme-preferences';

import { resolveSemanticTheme, type SemanticTheme } from './theme';

type AppThemeProviderProps = {
  children: ReactNode;
  systemScheme: ThemeMode | 'unspecified' | null | undefined;
  themePreference: ThemePreference;
};

const fallbackTheme = resolveSemanticTheme('system', 'unspecified');

const AppThemeContext = createContext<SemanticTheme>(fallbackTheme);

export function AppThemeProvider({ children, systemScheme, themePreference }: AppThemeProviderProps) {
  const theme = useMemo(
    () => resolveSemanticTheme(themePreference, systemScheme),
    [systemScheme, themePreference]
  );

  return <AppThemeContext.Provider value={theme}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
