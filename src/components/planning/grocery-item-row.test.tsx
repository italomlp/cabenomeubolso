import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { GroceryItemRow } from './grocery-item-row';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('GroceryItemRow', () => {
  it('renders planned and actual labels without color-only meaning', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <GroceryItemRow
            actualLabel="Actual"
            actualValue="$4.20"
            plannedLabel="Planned"
            plannedValue="$4.00"
            quantityLabel="2 piece"
            title="Milk"
          />
        </AppThemeProvider>
      );
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Milk');
    expect(texts).toContain('2 piece');
    expect(texts).toContain('Planned');
    expect(texts).toContain('Actual');
  });
});
