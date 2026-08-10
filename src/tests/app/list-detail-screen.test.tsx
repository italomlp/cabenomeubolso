import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import type { ComponentProps } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import ListDetailScreen from '@/components/planning/list-detail-screen';
import type { ShoppingList } from '@/domain/shopping-list';
import { i18n } from '@/lib/localization/i18n';

type ListDetailScreenDependencies = NonNullable<NonNullable<ComponentProps<typeof ListDetailScreen>>['dependencies']>;

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'USD', languageTag: 'en-US', regionCode: 'US' }],
}));

function createList(): ShoppingList {
  return {
    budgetMinor: 400,
    createdAt: '2026-08-04T12:00:00.000Z',
    currencyCode: 'USD',
    deletedAt: null,
    finalizedAt: null,
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
        quantityMilli: 2000,
        sortOrder: 1,
        unitCode: 'piece',
        updatedAt: '2026-08-04T12:00:00.000Z',
      },
    ],
    name: 'Weekly groceries',
    status: 'draft',
    updatedAt: '2026-08-04T12:00:00.000Z',
  };
}

function createRuntime(list: ShoppingList): ListDetailScreenDependencies {
  return {
    repository: {
      get: jest.fn(async () => list),
      list: jest.fn(async () => [list]),
      save: jest.fn(async () => undefined),
    },
    useCases: {
      finalizeList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      loadList: jest.fn(async (listId: string) => (listId === list.id ? JSON.parse(JSON.stringify(list)) : null)),
      reopenList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      saveList: jest.fn(async () => undefined),
    },
  } as const;
}

describe('ListDetailScreen', () => {
  it('loads the selected list into the route form', async () => {
    const runtime = createRuntime(createList());
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<ListDetailScreen dependencies={runtime} listId="list-1" />);
    });

    const inputs = tree!.root.findAllByType(TextInput);
    expect(inputs.find((input) => input.props.testID === 'create-list-name')?.props.value).toBe('Weekly groceries');
    expect(inputs.find((input) => input.props.testID === 'create-list-budget')?.props.value).toBe('$4.00');
  });
});
