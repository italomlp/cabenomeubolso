import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';
import { i18n } from '@/lib/localization/i18n';

import { PlannedItemEditorSheet } from './planned-item-editor';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('PlannedItemEditorSheet', () => {
  it('preserves raw pt-BR quantity text while focused and commits it on blur', async () => {
    const onSave = jest.fn();

    await act(async () => {
      await i18n.changeLanguage('pt-BR');
    });

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <PlannedItemEditorSheet currencyCode="BRL" initialUnitCode="kg" onCancel={jest.fn()} onSave={onSave} visible />
        </AppThemeProvider>
      );
    });

    const quantityInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-quantity')!;
    const priceInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-price')!;
    const nameInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-name')!;

    act(() => {
      nameInput().props.onChangeText?.('Batata');
      quantityInput().props.onFocus?.();
      quantityInput().props.onChangeText?.('1,5');
    });

    expect(quantityInput().props.value).toBe('1,5');

    act(() => {
      quantityInput().props.onBlur?.();
    });

    expect(quantityInput().props.value).toBe('1,5');

    act(() => {
      priceInput().props.onFocus?.();
      priceInput().props.onChangeText?.('12,34');
      priceInput().props.onBlur?.();
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'planned-item-save')!.props.onPress();
    });

    expect(onSave).toHaveBeenCalledWith({
      name: 'Batata',
      plannedUnitMinor: 1234,
      quantityMilli: 1500,
      unitCode: 'kg',
    });
  });

  it('preserves raw en quantity text while focused and commits it on blur', async () => {
    const onSave = jest.fn();

    await act(async () => {
      await i18n.changeLanguage('en');
    });

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <PlannedItemEditorSheet currencyCode="USD" initialUnitCode="kg" onCancel={jest.fn()} onSave={onSave} visible />
        </AppThemeProvider>
      );
    });

    const quantityInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-quantity')!;
    const priceInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-price')!;
    const nameInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-name')!;

    act(() => {
      nameInput().props.onChangeText?.('Potato');
      quantityInput().props.onFocus?.();
      quantityInput().props.onChangeText?.('1.5');
    });

    expect(quantityInput().props.value).toBe('1.5');

    act(() => {
      quantityInput().props.onBlur?.();
    });

    expect(quantityInput().props.value).toBe('1.5');

    act(() => {
      priceInput().props.onFocus?.();
      priceInput().props.onChangeText?.('12.34');
      priceInput().props.onBlur?.();
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'planned-item-save')!.props.onPress();
    });

    expect(onSave).toHaveBeenCalledWith({
      name: 'Potato',
      plannedUnitMinor: 1234,
      quantityMilli: 1500,
      unitCode: 'kg',
    });
  });

  it('prefills an item for editing and saves the edited draft', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    const onSave = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <PlannedItemEditorSheet
            currencyCode="USD"
            initialItem={{ name: 'Potatoes', plannedUnitMinor: 250, quantityMilli: 1500, unitCode: 'kg' }}
            onCancel={jest.fn()}
            onSave={onSave}
            visible
          />
        </AppThemeProvider>
      );
    });

    const inputs = tree!.root.findAllByType(TextInput);
    expect(inputs.find((input) => input.props.testID === 'planned-item-name')?.props.value).toBe('Potatoes');
    expect(inputs.find((input) => input.props.testID === 'planned-item-quantity')?.props.value).toBe('1.5');
    expect(inputs.find((input) => input.props.testID === 'planned-item-price')?.props.value).toBe('$2.50');

    act(() => {
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'planned-item-save')!.props.onPress();
    });

    expect(onSave).toHaveBeenCalledWith({ name: 'Potatoes', plannedUnitMinor: 250, quantityMilli: 1500, unitCode: 'kg' });
  });

  it('clears the quantity and price when the unit changes during editing', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    const onSave = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <PlannedItemEditorSheet
            currencyCode="USD"
            initialItem={{ name: 'Potatoes', plannedUnitMinor: 250, quantityMilli: 1500, unitCode: 'kg' }}
            onCancel={jest.fn()}
            onSave={onSave}
            visible
          />
        </AppThemeProvider>
      );
    });

    const quantityInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-quantity')!;
    const priceInput = () => tree!.root.findAllByType(TextInput).find((input) => input.props.testID === 'planned-item-price')!;

    act(() => {
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'planned-item-unit')!.props.onPress();
    });

    act(() => {
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'app-select-option-piece')!.props.onPress();
    });

    expect(quantityInput().props.value).toBe('');
    expect(priceInput().props.value).toBe('');

    act(() => {
      quantityInput().props.onFocus?.();
      quantityInput().props.onChangeText?.('2');
      quantityInput().props.onBlur?.();
      priceInput().props.onFocus?.();
      priceInput().props.onChangeText?.('3.50');
      priceInput().props.onBlur?.();
      tree!.root.findAllByType(mockExpoUi.Button).find((button) => button.props.testID === 'planned-item-save')!.props.onPress();
    });

    expect(onSave).toHaveBeenCalledWith({
      name: 'Potatoes',
      plannedUnitMinor: 350,
      quantityMilli: 2000,
      unitCode: 'piece',
    });
  });
});
