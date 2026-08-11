import { Text, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import ListDetailScreen from '@/components/planning/list-detail-screen';
import { createShoppingListUseCases } from '@/domain/shopping-list-use-cases';
import type { ShoppingList } from '@/domain/shopping-list';
import type { ShoppingListRepository } from '@/domain/shopping-list-repository';
import { i18n } from '@/lib/localization/i18n';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'USD', languageTag: 'en-US', regionCode: 'US' }],
}));

function createCompraSemanalList(status: ShoppingList['status'] = 'draft'): ShoppingList {
  return {
    budgetMinor: 12_345,
    createdAt: '2026-07-31T00:00:00.000Z',
    currencyCode: 'BRL',
    deletedAt: null,
    finalizedAt: status === 'finalized' ? '2026-07-31T10:00:00.000Z' : null,
    id: 'list-compra-semanal',
    items: [
      {
        actualUnitMinor: null,
        createdAt: '2026-07-31T00:00:00.000Z',
        deletedAt: null,
        id: 'item-1',
        listId: 'list-compra-semanal',
        name: 'Eggs',
        plannedUnitMinor: 350,
        purchasedAt: null,
        quantityMilli: 2000,
        sortOrder: 1,
        unitCode: 'piece',
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
      {
        actualUnitMinor: null,
        createdAt: '2026-07-31T00:00:00.000Z',
        deletedAt: null,
        id: 'item-2',
        listId: 'list-compra-semanal',
        name: 'Rice',
        plannedUnitMinor: 1000,
        purchasedAt: null,
        quantityMilli: 500000,
        sortOrder: 2,
        unitCode: 'g',
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
      {
        actualUnitMinor: null,
        createdAt: '2026-07-31T00:00:00.000Z',
        deletedAt: null,
        id: 'item-3',
        listId: 'list-compra-semanal',
        name: 'Potatoes',
        plannedUnitMinor: 200,
        purchasedAt: null,
        quantityMilli: 1500,
        sortOrder: 3,
        unitCode: 'kg',
        updatedAt: '2026-07-31T00:00:00.000Z',
      },
    ],
    name: 'Compra semanal',
    status,
    updatedAt: '2026-07-31T00:00:00.000Z',
  };
}

function createRuntime(list: ShoppingList) {
  let currentList = JSON.parse(JSON.stringify(list)) as ShoppingList;

  const repository: ShoppingListRepository = {
    get: jest.fn(async (id) => (id === currentList.id ? JSON.parse(JSON.stringify(currentList)) : null)),
    list: jest.fn(async () => [JSON.parse(JSON.stringify(currentList))]),
    save: jest.fn(async (nextList) => {
      currentList = JSON.parse(JSON.stringify(nextList)) as ShoppingList;
    }),
  };

  return {
    repository,
    useCases: createShoppingListUseCases({
      now: () => '2026-07-31T10:00:00.000Z',
      repository,
    }),
  };
}

describe('ListDetailScreen', () => {
  it('reopens Compra semanal without changing the exact item quantities', async () => {
    const runtime = createRuntime(createCompraSemanalList('finalized'));
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<ListDetailScreen dependencies={runtime} listId="list-compra-semanal" />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);
    expect(texts).toContain('2 piece');
    expect(texts).toContain('500 g');
    expect(texts).toContain('1.5 kg');

    await act(async () => {
      tree!.root
        .findAllByType(mockExpoUi.Button)
        .find((button) => button.props.testID === 'list-detail-reopen')!
        .props.onPress();
    });

    const reopenedTexts = tree!.root.findAllByType(Text).map((node) => node.props.children);
    expect(reopenedTexts).toContain('2 piece');
    expect(reopenedTexts).toContain('500 g');
    expect(reopenedTexts).toContain('1.5 kg');
    expect(tree!.root.findAllByType(mockExpoUi.Button).filter((button) => button.props.testID === 'list-detail-reopen')).toHaveLength(0);
    expect(tree!.root.findAllByType(mockExpoUi.Button).filter((button) => button.props.testID === 'create-list-save')).toHaveLength(1);
    expect(tree!.root.findAllByType(mockExpoUi.Button).filter((button) => button.props.testID === 'edit-item-item-3')).toHaveLength(1);
  });

  it('prefills the editor for an existing item and replaces it in place after save', async () => {
    const runtime = createRuntime(createCompraSemanalList('draft'));
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<ListDetailScreen dependencies={runtime} listId="list-compra-semanal" />);
    });

    await act(async () => {
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'edit-item-item-3')!.props.onPress();
    });

    const nameInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-name')!;
    const quantityInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-quantity')!;

    expect(nameInput().props.value).toBe('Potatoes');
    expect(quantityInput().props.value).toBe('1.5');

    await act(async () => {
      nameInput().props.onChangeText?.('Sweet potatoes');
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'planned-item-save')!.props.onPress();
    });

    const updatedTexts = tree!.root.findAllByType(Text).map((node) => node.props.children);
    expect(updatedTexts).toContain('Sweet potatoes');
    expect(updatedTexts).not.toContain('Potatoes');
    expect(updatedTexts).toContain('2 piece');
    expect(updatedTexts).toContain('500 g');
    expect(updatedTexts).toContain('1.5 kg');
  });
});
