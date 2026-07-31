import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from './expo-ui.mock';
import { BottomSheet, Button } from './expo-ui';
import { AppSelect } from './app-select';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppSelect', () => {
  it('marks selection and disabled state accessibly', () => {
    const onValueChange = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppSelect
            label="Currency"
            onValueChange={onValueChange}
            options={[
              { label: 'Brazilian real', value: 'BRL' },
              { label: 'US dollar', value: 'USD', disabled: true },
            ]}
            value="BRL"
          />
        </AppThemeProvider>
      );
    });

    act(() => {
      tree!.root.findByType(Button).props.onPress();
    });

    const bottomSheet = tree!.root.findByType(BottomSheet);
    const triggerButton = tree!.root.findByType(Button);
    const selectedOption = tree!.root.findByProps({ testID: 'app-select-option-BRL' });
    const disabledOption = tree!.root.findByProps({ testID: 'app-select-option-USD' });

    expect(bottomSheet.props.isPresented).toBe(true);
    expect(triggerButton.props.accessibilityLabel).toBe('Currency');
    expect(triggerButton.props.accessibilityValue).toEqual({ text: 'Brazilian real' });
    expect(selectedOption.props.accessibilityRole).toBe('radio');
    expect(selectedOption.props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(disabledOption.props.accessibilityState).toEqual({ checked: false, disabled: true });

    act(() => {
      disabledOption.props.onPress();
    });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(bottomSheet.props.isPresented).toBe(true);
  });
});
