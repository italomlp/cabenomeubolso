import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from './expo-ui.mock';
import { BottomSheet } from './expo-ui';
import { AppSheet } from './app-sheet';

jest.mock('./expo-ui', () => mockExpoUi);

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
