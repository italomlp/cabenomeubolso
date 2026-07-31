/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveThemeMode, useThemePreferencesStore } from '@/stores/theme-preferences';

export function useTheme() {
  const scheme = useColorScheme();
  const themePreference = useThemePreferencesStore((state) => state.themePreference);
  const theme = resolveThemeMode(themePreference, scheme);

  return Colors[theme];
}
