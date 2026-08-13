import { Text, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { DEFAULT_DRAFT_LIST_ID } from '@/app/home-state';
import CreateListRoute from '@/app/list/new';
import ListDetailRoute from '@/app/list/[id]';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { createShoppingListUseCases } from '@/domain/shopping-list-use-cases';
import type { ShoppingList } from '@/domain/shopping-list';
import type { ShoppingListRepository } from '@/domain/shopping-list-repository';
import { i18n } from '@/lib/localization/i18n';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams: { id: string } = { id: DEFAULT_DRAFT_LIST_ID };
let mockRuntime: ReturnType<typeof createRouteRuntime>;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('@/components/planning/planning-runtime', () => ({
  usePlanningRuntime: () => mockRuntime,
}));

jest.mock('@/components/ui/expo-ui', () => {
  const expoUiMock = jest.requireActual('@/components/ui/expo-ui.mock') as typeof import('@/components/ui/expo-ui.mock');

  return {
    ...expoUiMock,
    useNativeState: expoUiMock.useNativeState,
  };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'USD', languageTag: 'en-US', regionCode: 'US' }],
}));

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createRouteRuntime() {
  let currentList: ShoppingList | null = null;
  const saveMock = jest.fn(async (nextList: ShoppingList) => {
    currentList = clone(nextList);
  });

  const repository: ShoppingListRepository = {
    get: jest.fn(async (id: string) => (currentList !== null && currentList.id === id ? clone(currentList) : null)),
    list: jest.fn(async () => (currentList === null ? [] : [clone(currentList)])),
    save: saveMock,
  };

  return {
    repository,
    saveMock,
    useCases: createShoppingListUseCases({
      now: () => '2026-08-11T09:30:00.000Z',
      repository,
    }),
    seed(list: ShoppingList) {
      currentList = clone(list);
    },
  };
}

function getButton(tree: renderer.ReactTestRenderer, testID: string) {
  const button = tree.root.findAllByType(mockExpoUi.Button).find((node) => node.props.testID === testID);

  if (button === undefined) {
    throw new Error(`Button not found: ${testID}`);
  }

  return button;
}

function getUndoButton(tree: renderer.ReactTestRenderer) {
  const button = tree.root.findAllByType(mockExpoUi.Button).find((node) => node.props.testID === 'home-undo');

  if (button === undefined) {
    throw new Error('Undo button not found');
  }

  return button;
}

function getTextValues(tree: renderer.ReactTestRenderer) {
  return tree.root.findAllByType(Text).flatMap((node) => node.props.children).filter((value): value is string => typeof value === 'string');
}

function getTextInput(tree: renderer.ReactTestRenderer, testID: string) {
  const input = tree.root.findAllByType(TextInput).find((node) => node.props.testID === testID);

  if (input === undefined) {
    throw new Error(`TextInput not found: ${testID}`);
  }

  return input;
}

async function fillPlannedItem(tree: renderer.ReactTestRenderer, params: { name: string; quantity: string; price: string; unitTestID?: string }) {
  const nameInput = getTextInput(tree, 'planned-item-name');
  const quantityInput = getTextInput(tree, 'planned-item-quantity');
  const priceInput = getTextInput(tree, 'planned-item-price');

  if (params.unitTestID !== undefined) {
    await act(async () => {
      getButton(tree, 'planned-item-unit').props.onPress();
    });

    await act(async () => {
      getButton(tree, params.unitTestID!).props.onPress();
    });
  }

  await act(async () => {
    nameInput.props.onChangeText?.(params.name);
    quantityInput.props.onFocus?.();
    quantityInput.props.onChangeText?.(params.quantity);
    quantityInput.props.onBlur?.();
    priceInput.props.onFocus?.();
    priceInput.props.onChangeText?.(params.price);
    priceInput.props.onBlur?.();
    getButton(tree, 'planned-item-save').props.onPress();
  });
}

describe('app planning route flows', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockSearchParams = { id: DEFAULT_DRAFT_LIST_ID };
    mockRuntime = createRouteRuntime();
  });

  it('covers create-list-finalize, reopen, remove, and Undo across routes', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<CreateListRoute />);
      await Promise.resolve();
    });

    await act(async () => {
      getTextInput(tree!, 'create-list-name').props.onChangeText?.('Compra semanal');
      getTextInput(tree!, 'create-list-budget').props.onChangeText?.('$40.00');
      getButton(tree!, 'create-list-add-item').props.onPress();
    });

    await fillPlannedItem(tree!, { name: 'Eggs', quantity: '2', price: '2.00' });
    await act(async () => {
      getButton(tree!, 'create-list-add-item').props.onPress();
    });
    await fillPlannedItem(tree!, { name: 'Rice', quantity: '500', price: '3.00', unitTestID: 'app-select-option-g' });
    await act(async () => {
      getButton(tree!, 'create-list-add-item').props.onPress();
    });
    await fillPlannedItem(tree!, { name: 'Potatoes', quantity: '1.5', price: '5.00', unitTestID: 'app-select-option-kg' });

    await act(async () => {
      getButton(tree!, 'create-list-finalize').props.onPress();
      await Promise.resolve();
    });

    const persistedList = mockRuntime.saveMock.mock.calls[mockRuntime.saveMock.mock.calls.length - 1]?.[0] as ShoppingList | undefined;
    expect(persistedList?.id).toBeTruthy();
    mockSearchParams = { id: persistedList!.id };

    expect(persistedList).toMatchObject({
      budgetMinor: 4_000,
      currencyCode: 'USD',
      name: 'Compra semanal',
      status: 'finalized',
      items: [
        expect.objectContaining({ quantityMilli: 2_000, unitCode: 'piece' }),
        expect.objectContaining({ quantityMilli: 500_000, unitCode: 'g' }),
        expect.objectContaining({ quantityMilli: 1_500, unitCode: 'kg' }),
      ],
    });

    await act(async () => {
      tree!.unmount();
    });

    await act(async () => {
      tree = renderer.create(<ListDetailRoute />);
      await Promise.resolve();
    });

    expect(getTextValues(tree!)).toEqual(expect.arrayContaining(['2 piece', '500 g', '1.5 kg']));

    await act(async () => {
      getButton(tree!, 'list-detail-reopen').props.onPress();
      await Promise.resolve();
    });

    expect(getTextValues(tree!)).toEqual(expect.arrayContaining(['2 piece', '500 g', '1.5 kg']));
    const riceItem = persistedList!.items[1]!;
    expect(tree!.root.findAllByType(mockExpoUi.Button).some((node) => node.props.testID === `remove-item-${riceItem.id}`)).toBe(true);

    await act(async () => {
      getButton(tree!, `remove-item-${riceItem.id}`).props.onPress();
      await Promise.resolve();
    });

    expect(getTextValues(tree!)).not.toContain('500 g');
    expect(getTextValues(tree!)).toEqual(expect.arrayContaining(['Removed Rice. Undo?']));

    await act(async () => {
      getUndoButton(tree!).props.onPress();
      await Promise.resolve();
    });

    expect(getTextValues(tree!)).toEqual(expect.arrayContaining(['2 piece', '500 g', '1.5 kg']));
    expect(getTextValues(tree!)).not.toEqual(expect.arrayContaining(['Removed Rice. Undo?']));
  });
});
