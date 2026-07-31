import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import { i18n } from '@/lib/localization/i18n';
import { resolveLocalizationPreferences } from '@/lib/localization/resolution';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';
import { resolveThemeMode, useThemePreferencesStore } from '@/stores/theme-preferences';

export default function RootLayout() {
  const scheme = useColorScheme();
  const themePreference = useThemePreferencesStore((state) => state.themePreference);
  const themeMode = resolveThemeMode(themePreference, scheme);
  const [isReady, setIsReady] = useState(false);
  const [bootError, setBootError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    const initializeShell = async () => {
      try {
        await Promise.all([
          ensureSQLiteBootstrapped(),
          useLocalizationPreferencesStore.persist.rehydrate(),
          useThemePreferencesStore.persist.rehydrate(),
        ]);

        const locales = getLocales();
        const preferences = useLocalizationPreferencesStore.getState();
        const { language } = resolveLocalizationPreferences(preferences, locales);

        await i18n.changeLanguage(language);

        if (isActive) {
          setIsReady(true);
        }
      } catch (error) {
        if (isActive) {
          setBootError(error instanceof Error ? error : new Error('Failed to initialize app shell'));
        }
      }
    };

    void initializeShell();

    return () => {
      isActive = false;
    };
  }, []);

  if (bootError !== null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>Unable to start the app shell.</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>Loading app shell…</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
