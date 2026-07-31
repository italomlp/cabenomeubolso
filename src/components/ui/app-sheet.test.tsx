import React from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import { BottomSheet } from './expo-ui';
import { AppSheet } from './app-sheet';

jest.mock('./expo-ui', () => {
  const { Text: RNText, View: RNView } = jest.requireActual('react-native') as typeof import('react-native');

  return {
    BottomSheet: ({ children }: { children: React.ReactNode }) => <RNView>{children}</RNView>,
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
  };
});

describe('AppSheet', () => {
  it('dismisses through the bottom-sheet callback', () => {
    const onClose = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppSheet onClose={onClose} title="Sheet" visible>
            <View />
          </AppSheet>
        </AppThemeProvider>
      );
    });

    tree!.root.findByType(BottomSheet).props.onDismiss();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
