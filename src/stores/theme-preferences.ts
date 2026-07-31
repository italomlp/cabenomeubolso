import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

export type ThemeMode = 'light' | 'dark';

type ThemePreferencesState = {
  themePreference: ThemePreference;
  setThemePreference: (themePreference: ThemePreference) => void;
};

export const THEME_PREFERENCES_STORAGE_KEY = 'theme-preferences-v1';

export function resolveThemeMode(
  themePreference: ThemePreference,
  systemScheme: ThemeMode | 'unspecified' | null | undefined
): ThemeMode {
  if (themePreference !== 'system') {
    return themePreference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}

export const useThemePreferencesStore = create<ThemePreferencesState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (themePreference) => {
        set({ themePreference });
      },
    }),
    {
      name: THEME_PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
