import React from 'react';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import { TextInput } from './expo-ui';
import { AppTextField } from './app-text-field';

jest.mock('./expo-ui', () => {
  const { Text: RNText, TextInput: RNTextInput, View: RNView } = jest.requireActual('react-native') as typeof import('react-native');

  return {
    Column: ({ children, spacing, style, ...props }: { children: React.ReactNode; spacing?: number; style?: StyleProp<ViewStyle> }) => (
      <RNView {...props} style={[style, spacing != null ? { gap: spacing } : null]}>
        {children}
      </RNView>
    ),
    Text: ({ children, textStyle, style, ...props }: { children: React.ReactNode; textStyle?: StyleProp<TextStyle>; style?: StyleProp<TextStyle> }) => (
      <RNText {...props} style={[style, textStyle]}>
        {children}
      </RNText>
    ),
    TextInput: ({ style, textStyle, ...props }: { style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => (
      <RNTextInput {...props} style={[style, textStyle]} />
    ),
  };
});

describe('AppTextField', () => {
  it('updates the border color when focused and blurred', () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppTextField label="Search" onBlur={onBlur} onFocus={onFocus} placeholder="Type here" />
        </AppThemeProvider>
      );
    });

    const input = () => tree!.root.findByType(TextInput);

    expect(input().props.accessibilityLabel).toBe('Search');
    expect(input().props.style.borderColor).toBe('#D7DFEA');

    act(() => {
      input().props.onFocus?.({ nativeEvent: { target: 1 } });
    });

    expect(input().props.style.borderColor).toBe('#208AEF');
    expect(onFocus).toHaveBeenCalledWith({ nativeEvent: { target: 1 } });

    act(() => {
      input().props.onBlur?.({ nativeEvent: { target: 2 } });
    });

    expect(input().props.style.borderColor).toBe('#D7DFEA');
    expect(onBlur).toHaveBeenCalledWith({ nativeEvent: { target: 2 } });
  });
});
