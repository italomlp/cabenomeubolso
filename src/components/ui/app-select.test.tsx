import React from 'react';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import { BottomSheet, Button } from './expo-ui';
import { AppSelect } from './app-select';

jest.mock('./expo-ui', () => {
  const { Pressable: RNPressable, Text: RNText, View: RNView } = jest.requireActual('react-native') as typeof import('react-native');

  return {
    BottomSheet: ({ children }: { children: React.ReactNode }) => <RNView>{children}</RNView>,
    Button: ({ children, label, variant: _variant, ...props }: { children?: React.ReactNode; label?: string; variant?: string }) => (
      <RNPressable {...props}>{children ?? <RNText>{label}</RNText>}</RNPressable>
    ),
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

describe('AppSelect', () => {
  it('marks selection and disabled state accessibly', () => {
    const onValueChange = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppSelect
            label="Currency"
            onValueChange={onValueChange}
            options={[
              { label: 'Brazilian real', value: 'BRL' },
              { label: 'US dollar', value: 'USD', disabled: true },
            ]}
            value="BRL"
          />
        </AppThemeProvider>
      );
    });

    act(() => {
      tree!.root.findByType(Button).props.onPress();
    });

    const bottomSheet = tree!.root.findByType(BottomSheet);
    const triggerButton = tree!.root.findByType(Button);
    const selectedOption = tree!.root.findByProps({ testID: 'app-select-option-BRL' });
    const disabledOption = tree!.root.findByProps({ testID: 'app-select-option-USD' });

    expect(bottomSheet.props.isPresented).toBe(true);
    expect(triggerButton.props.accessibilityLabel).toBe('Currency');
    expect(triggerButton.props.accessibilityValue).toEqual({ text: 'Brazilian real' });
    expect(selectedOption.props.accessibilityRole).toBe('radio');
    expect(selectedOption.props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(disabledOption.props.accessibilityState).toEqual({ checked: false, disabled: true });

    act(() => {
      disabledOption.props.onPress();
    });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(bottomSheet.props.isPresented).toBe(true);
  });
});
