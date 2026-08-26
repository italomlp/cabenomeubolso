import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import type { ShoppingList } from '@/domain/shopping-list';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { Button } from '@/components/ui/expo-ui';

import { ListCard } from './list-card';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

function createList(status: ShoppingList['status']): ShoppingList {
  return {
    budgetMinor: 4000,
    createdAt: '2026-08-04T12:00:00.000Z',
    currencyCode: 'USD',
    deletedAt: null,
    finalizedAt: status === 'finalized' ? '2026-08-04T12:00:00.000Z' : null,
    id: 'list-1',
    items: [
      {
        actualUnitMinor: null,
        createdAt: '2026-08-04T12:00:00.000Z',
        deletedAt: null,
        id: 'item-1',
        listId: 'list-1',
        name: 'Milk',
        plannedUnitMinor: 350,
        purchasedAt: null,
        quantityMilli: 1000,
        sortOrder: 1,
        unitCode: 'piece',
        updatedAt: '2026-08-04T12:00:00.000Z',
      },
    ],
    name: 'Weekly groceries',
    status,
    updatedAt: '2026-08-04T12:00:00.000Z',
  };
}

describe('ListCard', () => {
  it('shows the list action labels', () => {
    const onFinalize = jest.fn();
    const onLoad = jest.fn();
    const onReopenAndEdit = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <ListCard
            budgetLabel="Budget"
            currencyLabel="Draft currency"
            editLabel="Edit"
            finalizeLabel="Finalize list"
            list={createList('draft')}
            onFinalize={onFinalize}
            onLoad={onLoad}
            onReopenAndEdit={onReopenAndEdit}
            resolveBudget={() => '$4.00'}
            resolveCurrency={() => 'US dollar'}
            reopenLabel="Reopen"
            statusLabel="Active"
          />
        </AppThemeProvider>
      );
    });

    const buttons = tree!.root.findAllByType(Button);

    expect(buttons.map((button) => button.props.label)).toEqual(expect.arrayContaining(['Edit', 'Finalize list']));
  });
});
