import { Text } from 'react-native';
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

describe('ListCard layout', () => {
  it('uses semantic spacing and omits the redundant item stat', () => {
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
            onFinalize={jest.fn()}
            onLoad={jest.fn()}
            onReopenAndEdit={jest.fn()}
            resolveBudget={() => '$4.00'}
            resolveCurrency={() => 'US dollar'}
            reopenLabel="Reopen"
            statusLabel="Active"
          />
        </AppThemeProvider>
      );
    });

    const card = tree!.root.findAllByType(mockExpoUi.Column)[0];
    const cardStyles = Array.isArray(card.props.style) ? card.props.style : [card.props.style];

    expect(cardStyles).toEqual(expect.arrayContaining([expect.objectContaining({ borderRadius: 12, padding: 12 })]));

    const texts = tree!.root.findAllByType(Text).flatMap((node) => node.props.children).filter((value): value is string => typeof value === 'string');
    const buttons = tree!.root.findAllByType(Button);

    expect(texts).not.toContain('Items');
    expect(buttons[0].props.label).toBe('Edit');
    expect(buttons[0].props.variant).toBe('filled');
  });
});
