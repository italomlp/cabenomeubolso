import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from './expo-ui.mock';
import { Button } from './expo-ui';
import { AppButton } from './app-button';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppButton', () => {
  it('maps destructive buttons to the risk token', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppButton label="Delete" variant="destructive" />
        </AppThemeProvider>
      );
    });

    const button = tree!.root.findByType(Button);

    expect(button.props.variant).toBe('filled');
    expect(button.props.style.backgroundColor).toBe('#B94D3C');
  });

  it.each([
    ['light', '#087F73'],
    ['dark', '#54C5B5'],
  ])('maps primary buttons to the %s focus token', (scheme, focusColor) => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme={scheme as 'light' | 'dark'} themePreference="system">
          <AppButton label="Continue" />
        </AppThemeProvider>
      );
    });

    const button = tree!.root.findByType(Button);

    expect(button.props.variant).toBe('filled');
    expect(button.props.style.backgroundColor).toBe(focusColor);
  });
});
