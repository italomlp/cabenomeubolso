import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { AppEmptyState } from './app-empty-state';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('AppEmptyState', () => {
  it('renders the empty-state message and recovery action', () => {
    const onAction = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppEmptyState actionLabel="Create list" body="No saved lists yet." onAction={onAction} title="Nothing to review yet" />
        </AppThemeProvider>
      );
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Nothing to review yet');
    expect(texts).toContain('No saved lists yet.');
  });
});
