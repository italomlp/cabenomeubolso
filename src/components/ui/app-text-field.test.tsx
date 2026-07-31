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
