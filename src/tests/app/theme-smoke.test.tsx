import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import type { ComponentProps } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import type { ThemeMode, ThemePreference } from '@/stores/theme-preferences';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { i18n } from '@/lib/localization/i18n';

import HomeScreen from '@/components/planning/home-screen';

type HomeScreenDependencies = NonNullable<NonNullable<ComponentProps<typeof HomeScreen>>['dependencies']>;

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'BRL', languageTag: 'en-US', regionCode: 'US' }],
}));

function createRuntime(): HomeScreenDependencies {
  return {
    repository: {
      get: jest.fn(async () => null),
      list: jest.fn(async () => []),
      save: jest.fn(async () => undefined),
    },
    useCases: {
      finalizeList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      loadList: jest.fn(async () => null),
      removeItem: jest.fn(async () => {
        throw new Error('not expected');
      }),
      reopenList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      restoreItem: jest.fn(async () => {
        throw new Error('not expected');
      }),
      saveList: jest.fn(async () => undefined),
    },
  };
}

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
          <HomeScreen dependencies={createRuntime()} />
        </AppThemeProvider>
      );
    });

    expect(tree!.root.findByProps({ colorScheme: expected })).toBeTruthy();
    expect(tree!.root.findAllByType(Text).map((node) => node.props.children)).toContain(
      'Home'
    );
  });
});
