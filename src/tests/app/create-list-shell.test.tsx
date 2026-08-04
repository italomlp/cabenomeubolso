import renderer, { act } from 'react-test-renderer';
import type { ComponentProps } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import HomeScreen, { buildCreateListDraft, canPersistCreateListDraft } from '@/app/index';
import type { ShoppingList } from '@/domain/shopping-list';
import { i18n } from '@/lib/localization/i18n';

type HomeScreenDependencies = NonNullable<NonNullable<ComponentProps<typeof HomeScreen>>['dependencies']>;

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'BRL', languageTag: 'pt-BR', regionCode: 'BR' }],
}));

function createRuntime(): HomeScreenDependencies {
  let savedList: ShoppingList | null = null;

  const runtime = {
    repository: {
      get: jest.fn(async () => savedList),
      list: jest.fn(async () => (savedList === null ? [] : [savedList])),
      save: jest.fn(async (list) => {
        savedList = JSON.parse(JSON.stringify(list)) as typeof savedList;
      }),
    },
    useCases: {
      finalizeList: jest.fn(async (listId: string) => {
        if (savedList === null || savedList.id !== listId) {
          throw new Error(`Shopping list not found: ${listId}`);
        }

        savedList = {
          ...savedList,
          finalizedAt: '2026-08-04T12:00:00.000Z',
          status: 'finalized',
        };

        return JSON.parse(JSON.stringify(savedList));
      }),
      loadList: jest.fn(async (listId: string) => {
        if (savedList === null || savedList.id !== listId) {
          return null;
        }

        return JSON.parse(JSON.stringify(savedList));
      }),
      reopenList: jest.fn(async (listId: string) => {
        if (savedList === null || savedList.id !== listId) {
          throw new Error(`Shopping list not found: ${listId}`);
        }

        savedList = {
          ...savedList,
          finalizedAt: null,
          status: 'draft',
        };

        return JSON.parse(JSON.stringify(savedList));
      }),
      saveList: jest.fn(async (list) => {
        savedList = JSON.parse(JSON.stringify(list)) as typeof savedList;
      }),
    },
  } as const;

  return runtime;
}

describe('create list shell rules', () => {
  it('parses localized budget input at the UI boundary', () => {
    const draft = buildCreateListDraft(
      {
        budgetText: 'R$ 40,00',
        currencyCode: 'BRL',
        itemCount: 1,
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
        listId: 'list-1',
        name: 'Weekly groceries',
        status: 'draft',
      },
      '2026-08-04T12:00:00.000Z',
      'pt-BR'
    );

    expect(draft).toMatchObject({
      budgetMinor: 4000,
      currencyCode: 'BRL',
      id: 'list-1',
      name: 'Weekly groceries',
      status: 'draft',
    });
    expect(
      canPersistCreateListDraft(
        {
          budgetText: 'R$ 40,00',
          currencyCode: 'BRL',
          itemCount: 1,
          items: draft.items,
          listId: 'list-1',
          name: 'Weekly groceries',
          status: 'draft',
        },
        'pt-BR'
      )
    ).toBe(true);
  });

  it('wires create/save through the repository-backed home flow and locks currency after the first item', async () => {
    const runtime = createRuntime();
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('pt-BR');
      tree = renderer.create(<HomeScreen dependencies={runtime} />);
    });

    await act(async () => {
      tree!.root
        .findAllByType(mockExpoUi.Button)
        .find((button) => button.props.label === 'Criar lista')!
        .props.onPress();
    });

    expect(tree!.root.findAllByProps({ testID: 'create-list-currency' }).length).toBeGreaterThan(0);

    const nameInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'create-list-name')!;
    const budgetInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'create-list-budget')!;
    const addItemButton = tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'create-list-add-item')!;

    await act(async () => {
      nameInput.props.onChangeText?.('Compra semanal');
      budgetInput.props.onChangeText?.('R$ 40,00');
      addItemButton.props.onPress();
    });

    const itemNameInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'planned-item-name')!;
    const quantityInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'planned-item-quantity')!;
    const priceInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'planned-item-price')!;

    await act(async () => {
      itemNameInput.props.onChangeText?.('Milk');
      quantityInput.props.onFocus?.();
      quantityInput.props.onChangeText?.('2');
      quantityInput.props.onBlur?.();
      priceInput.props.onFocus?.();
      priceInput.props.onChangeText?.('3,50');
      priceInput.props.onBlur?.();
      tree!.root.findAllByProps({ testID: 'planned-item-save' })[0].props.onPress();
    });

    expect(tree!.root.findAllByProps({ testID: 'create-list-currency' })).toHaveLength(0);

    await act(async () => {
      tree!.root.findAllByProps({ testID: 'create-list-save' })[0].props.onPress();
    });

    expect(runtime.useCases.saveList).toHaveBeenCalledTimes(1);
    expect(runtime.useCases.saveList).toHaveBeenCalledWith(
      expect.objectContaining({
        budgetMinor: 4000,
        currencyCode: 'BRL',
        name: 'Compra semanal',
        status: 'draft',
        items: [
          expect.objectContaining({
            name: 'Milk',
            plannedUnitMinor: 350,
            quantityMilli: 2000,
            unitCode: 'piece',
          }),
        ],
      })
    );
  });
});
