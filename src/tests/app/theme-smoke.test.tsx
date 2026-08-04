import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import type { ThemeMode, ThemePreference } from '@/stores/theme-preferences';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { i18n } from '@/lib/localization/i18n';

import HomeScreen from '@/app/index';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('HomeScreen theme smoke', () => {
  const themeCases: [string, ThemePreference, ThemeMode, ThemeMode][] = [
    ['system light', 'system', 'light', 'light'],
    ['system dark', 'system', 'dark', 'dark'],
    ['light override', 'light', 'dark', 'light'],
    ['dark override', 'dark', 'light', 'dark'],
  ];

  it.each(themeCases)('resolves %s to the expected host color scheme', async (label, themePreference, systemScheme, expected) => {
    void label;

    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(
        <AppThemeProvider systemScheme={systemScheme} themePreference={themePreference}>
          <HomeScreen />
        </AppThemeProvider>
      );
    });

    expect(tree!.root.findByProps({ colorScheme: expected })).toBeTruthy();
    expect(tree!.root.findAllByType(Text).map((node) => node.props.children)).toContain(
      'Home'
    );
  });
});
