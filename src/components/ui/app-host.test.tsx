import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from './expo-ui.mock';
import { AppHost } from './app-host';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppHost', () => {
  it('maps the resolved semantic mode to the @expo/ui Host boundary', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="dark" themePreference="system">
          <AppHost>
            <View testID="child" />
          </AppHost>
        </AppThemeProvider>
      );
    });

    const host = tree!.root.findByProps({ colorScheme: 'dark' });

    expect(host).toBeTruthy();
    expect(host.findByProps({ testID: 'child' })).toBeTruthy();
  });
});
