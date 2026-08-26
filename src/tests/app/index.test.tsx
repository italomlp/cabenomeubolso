import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import type { ComponentProps } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import { i18n } from '@/lib/localization/i18n';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import type { ShoppingList } from '@/domain/shopping-list';

import HomeScreen from '@/components/planning/home-screen';

type HomeScreenDependencies = NonNullable<NonNullable<ComponentProps<typeof HomeScreen>>['dependencies']>;

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'BRL', languageTag: 'pt-BR', regionCode: 'BR' }],
}));

function createRuntime(lists: readonly ShoppingList[] = []): HomeScreenDependencies {
  return {
    repository: {
      get: jest.fn(async () => null),
      list: jest.fn(async () => lists),
      save: jest.fn(async () => undefined),
    },
    useCases: {
      finalizeList: jest.fn(async () => lists[0]!),
      loadList: jest.fn(async () => null),
      removeItem: jest.fn(async () => {
        throw new Error('not expected');
      }),
      reopenList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      restoreItem: jest.fn(async () => {
        throw new Error('not expected');
      }),
      saveList: jest.fn(async () => undefined),
    },
  } as const;
}

function createListWithUnpurchasedItem(): ShoppingList {
  return {
    budgetMinor: 1_000,
    createdAt: '2026-08-01T00:00:00.000Z',
    currencyCode: 'BRL',
    deletedAt: null,
    finalizedAt: null,
    id: 'list-with-unpurchased-item',
    items: [
      {
        actualUnitMinor: null,
        createdAt: '2026-08-01T00:00:00.000Z',
        deletedAt: null,
        id: 'item-unpurchased',
        listId: 'list-with-unpurchased-item',
        name: 'Coffee',
        plannedUnitMinor: 1_000,
        purchasedAt: null,
        quantityMilli: 1_000,
        sortOrder: 1,
        unitCode: 'piece',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    name: 'Weekly groceries',
    status: 'draft',
    updatedAt: '2026-08-01T00:00:00.000Z',
  };
}

describe('HomeScreen', () => {
  it('renders the localized home and create-list shell copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<HomeScreen dependencies={createRuntime()} />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Home');
    expect(texts).toContain('Plan the next list offline before you shop.');
    expect(texts).toContain('Create list');
    expect(texts).toContain('Nothing to review yet');
    expect(tree!.root.findAllByType(mockExpoUi.Button).some((button) => button.props.testID === 'home-primary-create')).toBe(true);
  });

  it('renders the pt-BR shell copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('pt-BR');
      tree = renderer.create(<HomeScreen dependencies={createRuntime()} />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Início');
    expect(texts).toContain('Planeje a próxima lista offline antes de comprar.');
    expect(texts).toContain('Criar lista');
    expect(texts).toContain('Nada para revisar ainda');
  });

  it('waits for confirmation before finalizing a list with an unpurchased item', async () => {
    const list = createListWithUnpurchasedItem();
    const runtime = createRuntime([list]);
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<HomeScreen dependencies={runtime} />);
    });

    await act(async () => {
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === `finalize-${list.id}`)!.props.onPress();
    });

    expect(runtime.useCases.finalizeList).not.toHaveBeenCalled();
    expect(tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'finalize-confirm')).toBeDefined();

    await act(async () => {
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'finalize-confirm')!.props.onPress();
    });

    expect(runtime.useCases.finalizeList).toHaveBeenCalledWith(list.id);
  });
});
