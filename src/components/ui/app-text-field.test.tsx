import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from './expo-ui.mock';
import { TextInput } from './expo-ui';
import { AppTextField } from './app-text-field';

jest.mock('./expo-ui', () => mockExpoUi);

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

    expect(input().props.style.borderColor).toBe('#E4DED2');
    expect(input().props.modifiers).toHaveLength(1);

    act(() => {
      input().props.onFocus?.();
    });

    expect(input().props.style.borderColor).toBe('#087F73');
    expect(onFocus).toHaveBeenCalledWith();

    act(() => {
      input().props.onBlur?.();
    });

    expect(input().props.style.borderColor).toBe('#E4DED2');
    expect(onBlur).toHaveBeenCalledWith();
  });

  it('uses a distinct placeholder color from entered text', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppTextField label="Search" placeholder="Type here" />
        </AppThemeProvider>
      );
    });

    const input = tree!.root.findByType(TextInput);

    expect(input.props.placeholderTextColor).toBe('#7C8882');
    expect(input.props.textStyle.color).toBe('#1D2B28');
    expect(input.props.placeholderTextColor).not.toBe(input.props.textStyle.color);
  });
});
