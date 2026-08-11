import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from './expo-ui.mock';
import { AppHost } from './app-host';
import { AppScreen } from './app-screen';
import { ScrollView } from './expo-ui';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppScreen', () => {
  it('uses the scroll boundary and keeps content accessible', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppScreen>
            <Text testID="child">Content</Text>
          </AppScreen>
        </AppThemeProvider>
      );
    });

    const scrollView = tree!.root.findByType(ScrollView);

    expect(scrollView.findByType(AppHost)).toBeTruthy();
    expect(scrollView.findByProps({ testID: 'child' })).toBeTruthy();
  });
});
