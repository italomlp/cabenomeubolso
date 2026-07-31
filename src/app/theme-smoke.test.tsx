import React from 'react';
import { Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import type { ThemeMode, ThemePreference } from '@/stores/theme-preferences';

import { AppThemeProvider } from '@/design-system/theme-context';

import HomeScreen from './index';

jest.mock('@/components/ui/expo-ui', () => {
  const { Pressable, Text: RNText, TextInput: RNTextInput, View: RNView } = jest.requireActual('react-native') as typeof import('react-native');

  return {
    BottomSheet: ({ children }: { children: React.ReactNode }) => <RNView>{children}</RNView>,
    Button: ({ children, label, variant: _variant, ...props }: { children?: React.ReactNode; label?: string; variant?: string }) => (
      <Pressable {...props}>{children ?? <RNText>{label}</RNText>}</Pressable>
    ),
    Column: ({
      children,
      spacing,
      style,
      ...props
    }: {
      children: React.ReactNode;
      spacing?: number;
      style?: StyleProp<ViewStyle>;
    }) => (
      <RNView {...props} style={[style, spacing != null ? { gap: spacing } : null]}>
        {children}
      </RNView>
    ),
    Row: ({
      children,
      spacing,
      style,
      ...props
    }: {
      children: React.ReactNode;
      spacing?: number;
      style?: StyleProp<ViewStyle>;
    }) => (
      <RNView {...props} style={[style, spacing != null ? { gap: spacing } : null]}>
        {children}
      </RNView>
    ),
    Text: ({
      children,
      textStyle,
      style,
      ...props
    }: {
      children: React.ReactNode;
      textStyle?: StyleProp<TextStyle>;
      style?: StyleProp<TextStyle>;
    }) => (
      <RNText {...props} style={[style, textStyle]}>
        {children}
      </RNText>
    ),
    Host: ({
      children,
      colorScheme: _colorScheme,
      style,
      ...props
    }: {
      children: React.ReactNode;
      colorScheme?: string;
      style?: StyleProp<ViewStyle>;
    }) => <RNView {...props} style={style}>{children}</RNView>,
    TextInput: ({ style, textStyle, ...props }: { style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
      <RNTextInput {...props} style={[style, textStyle]} />
    ),
  };
});

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
