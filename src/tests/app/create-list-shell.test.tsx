import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { i18n } from '@/lib/localization/i18n';

import HomeScreen, { buildCreateListDraft, canPersistCreateListDraft } from '@/app/index';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('create list shell rules', () => {
  it('keeps currency selection independent from save/finalize readiness', () => {
    expect(
      canPersistCreateListDraft({
        budgetText: '',
        currencyCode: 'USD',
        itemCount: 0,
        name: '',
      })
    ).toBe(false);

    expect(
      canPersistCreateListDraft({
        budgetText: '4000',
        currencyCode: 'USD',
        itemCount: 0,
        name: 'Weekly groceries',
      })
    ).toBe(false);

    expect(
      canPersistCreateListDraft({
        budgetText: '4000',
        currencyCode: 'USD',
        itemCount: 1,
        name: 'Weekly groceries',
      })
    ).toBe(true);
  });

  it('builds a draft list shell with placeholder items for validation', () => {
    const draft = buildCreateListDraft(
      {
        budgetText: '2500',
        currencyCode: 'BRL',
        itemCount: 2,
        name: 'Weekly groceries',
      },
      '2026-08-04T12:00:00.000Z'
    );

    expect(draft).toMatchObject({
      budgetMinor: 2500,
      currencyCode: 'BRL',
      id: 'create-list-shell-draft',
      items: [
        { id: 'create-list-shell-draft-item-1', listId: 'create-list-shell-draft', sortOrder: 1, unitCode: 'piece' },
        { id: 'create-list-shell-draft-item-2', listId: 'create-list-shell-draft', sortOrder: 2, unitCode: 'piece' },
      ],
      name: 'Weekly groceries',
      status: 'draft',
    });
  });

  it('shows the currency selector before items exist and locks it after the first item', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<HomeScreen />);
    });

    const openCreateList = tree!.root
      .findAllByType(mockExpoUi.Button)
      .find((button) => button.props.label === 'Create list')!;

    act(() => {
      openCreateList.props.onPress();
    });

    expect(
      tree!.root.findAllByType(mockExpoUi.Button).filter((button) => button.props.testID === 'create-list-currency')
    ).toHaveLength(1);

    const addItemButton = tree!.root
      .findAllByType(mockExpoUi.Button)
      .find((button) => button.props.label === 'Add planned item')!;

    act(() => {
      addItemButton.props.onPress();
    });

    expect(tree!.root.findAllByType(Text).map((node) => node.props.children)).toContain('Planned item');

    const nameInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'planned-item-name')!;
    const quantityInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'planned-item-quantity')!;
    const priceInput = tree!.root.findAllByType(mockExpoUi.TextInput).find((input) => input.props.testID === 'planned-item-price')!;

    act(() => {
      nameInput.props.onChangeText?.('Milk');
      quantityInput.props.onFocus?.();
      quantityInput.props.onChangeText?.('2');
      quantityInput.props.onBlur?.();
      priceInput.props.onFocus?.();
      priceInput.props.onChangeText?.('3.50');
      priceInput.props.onBlur?.();
      tree!.root.findAllByProps({ testID: 'planned-item-save' })[0].props.onPress();
    });

    expect(
      tree!.root.findAllByType(mockExpoUi.Button).filter((button) => button.props.testID === 'create-list-currency')
    ).toHaveLength(0);

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Currency is locked after the first item exists.');
  });
});
