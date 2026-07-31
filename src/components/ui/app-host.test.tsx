import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import { AppHost } from './app-host';

jest.mock('./expo-ui', () => ({
  Host: ({
    children,
    colorScheme: _colorScheme,
    style,
    ...props
  }: {
    children: React.ReactNode;
    colorScheme?: string;
    style?: StyleProp<ViewStyle>;
  }) => {
    const { View: RNView } = jest.requireActual('react-native') as typeof import('react-native');

    return <RNView {...props} style={style}>{children}</RNView>;
  },
}));

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
