import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import type { ThemeMode, ThemePreference } from '@/stores/theme-preferences';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';

import HomeScreen from './index';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('HomeScreen theme smoke', () => {
  const themeCases: [string, ThemePreference, ThemeMode, ThemeMode][] = [
    ['system light', 'system', 'light', 'light'],
    ['system dark', 'system', 'dark', 'dark'],
    ['light override', 'light', 'dark', 'light'],
    ['dark override', 'dark', 'light', 'dark'],
  ];

  it.each(themeCases)('resolves %s to the expected host color scheme', (label, themePreference, systemScheme, expected) => {
    void label;

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme={systemScheme} themePreference={themePreference}>
          <HomeScreen />
        </AppThemeProvider>
      );
    });

    expect(tree!.root.findByProps({ colorScheme: expected })).toBeTruthy();
    expect(tree!.root.findAllByType(Text).map((node) => node.props.children)).toContain(
      'Expo foundation ready'
    );
  });
});
