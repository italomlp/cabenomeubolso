import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import { i18n } from '@/lib/localization/i18n';

import * as mockExpoUi from './expo-ui.mock';
import { AppUndoNotice } from './app-undo-notice';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppUndoNotice', () => {
  it('renders a localized undo action', async () => {
    const onUndo = jest.fn();

    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppUndoNotice message="Removed item" onUndo={onUndo} visible />
        </AppThemeProvider>
      );
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Removed item');
    expect(texts).toContain('Undo');
  });
});
