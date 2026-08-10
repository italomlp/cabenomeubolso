import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { BudgetSummary } from './budget-summary';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('BudgetSummary', () => {
  it('renders budget status with both text and value', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <BudgetSummary
            accentColor="#2E7D32"
            body="Open lists keep moving until they are finalized."
            budgetLabel="Budget"
            budgetValue="$10.00"
            listLabel="Lists"
            listValue="2"
            title="Active summaries"
          />
        </AppThemeProvider>
      );
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Active summaries');
    expect(texts).toContain('Open lists keep moving until they are finalized.');
    expect(texts).toContain('Budget');
    expect(texts).toContain('$10.00');
  });
});
