import { Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from './expo-ui.mock';
import { AppButton, AppSelect, AppSheet, AppTextField } from './index';

jest.mock('./expo-ui', () => mockExpoUi);

describe('universal adapters', () => {
  it('renders the button, field, select, and sheet boundaries', () => {
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

  it('keeps placeholder styling distinct from entered text at the adapter boundary', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="dark" themePreference="system">
          <AppTextField label="Search" placeholder="Type here" />
        </AppThemeProvider>
      );
    });

    const input = tree!.root.findByType(mockExpoUi.TextInput);

    expect(input.props.placeholderTextColor).toBe('#8FA29A');
    expect(input.props.textStyle.color).toBe('#F4F0E8');
    expect(input.props.placeholderTextColor).not.toBe(input.props.textStyle.color);
  });
});
