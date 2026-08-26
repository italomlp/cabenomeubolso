import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import * as Linking from 'expo-linking';
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { AppThemeProvider } from '@/design-system/theme-context';
import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import { i18n } from '@/lib/localization/i18n';
import { resolveLocalizationPreferences } from '@/lib/localization/resolution';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';
import { resolveThemeMode, useThemePreferencesStore } from '@/stores/theme-preferences';

export default function RootLayout() {
  const scheme = useColorScheme();
  const languagePreference = useLocalizationPreferencesStore((state) => state.languagePreference);
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

        if (__DEV__) {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl !== null) {
            const { handleDevScreenshotDeepLink } = await import('@/lib/dev/screenshot-harness');
            await handleDevScreenshotDeepLink(initialUrl);
          }
        }

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

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void import('@/lib/dev/screenshot-harness').then(({ handleDevScreenshotDeepLink }) => handleDevScreenshotDeepLink(url));
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const { language } = resolveLocalizationPreferences(
      { currencyPreference: 'system', languagePreference },
      getLocales()
    );

    void i18n.changeLanguage(language);
  }, [isReady, languagePreference]);

  if (bootError !== null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>{i18n.t('app.error')}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>{i18n.t('app.loading')}</Text>
      </View>
    );
  }

  return (
    <AppThemeProvider systemScheme={scheme} themePreference={themePreference}>
      <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
