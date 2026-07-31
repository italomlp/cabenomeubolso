import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import { AdSlot, AppButton, AppSelect, AppSheet, AppTextField } from './index';

jest.mock('./expo-ui', () => {
  const { Pressable, Text: RNText, TextInput: RNTextInput, View } = jest.requireActual('react-native') as typeof import('react-native');

  return {
    BottomSheet: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Button: ({ children, label, variant: _variant, ...props }: { children?: React.ReactNode; label?: string; variant?: string }) => (
      <Pressable {...props}>{children ?? <RNText>{label}</RNText>}</Pressable>
    ),
    Column: ({ children, spacing, style, ...props }: { children: React.ReactNode; spacing?: number; style?: StyleProp<ViewStyle> }) => (
      <View {...props} style={[style, spacing != null ? { gap: spacing } : null]}>
        {children}
      </View>
    ),
    Row: ({ children, spacing, style, ...props }: { children: React.ReactNode; spacing?: number; style?: StyleProp<ViewStyle> }) => (
      <View {...props} style={[style, spacing != null ? { gap: spacing } : null]}>
        {children}
      </View>
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

describe('universal adapters', () => {
  it('renders the button, field, select, sheet, and ad slot boundaries', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <View>
            <AppButton label="Confirm" onPress={() => undefined} />
            <AppTextField label="Search" helperText="Semantic tokens" placeholder="Type here" />
            <AppSelect
              label="Currency"
              onValueChange={() => undefined}
              options={[{ label: 'Brazilian real', value: 'BRL' }]}
              placeholder="Choose"
              value="BRL"
            />
            <AppSheet visible={false} onClose={() => undefined} title="Sheet">
              <Text>Content</Text>
            </AppSheet>
            <AdSlot />
          </View>
        </AppThemeProvider>
      );
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Confirm');
    expect(texts).toContain('Search');
    expect(texts).toContain('Currency');
    expect(texts).toContain('Semantic tokens');
  });
});
