import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';
import * as mockExpoUi from './expo-ui.mock';
import { BottomSheet, Button } from './expo-ui';
import { AppSelect } from './app-select';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppSelect', () => {
  it('marks selection and disabled state in the option sheet', () => {
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
            testID="currency-select"
            value="BRL"
          />
        </AppThemeProvider>
      );
    });

    const triggerButton = () =>
      tree!.root.findAllByType(Button).find((button) => button.props.testID === 'currency-select')!;

    act(() => {
      triggerButton().props.onPress();
    });

    const bottomSheet = tree!.root.findByType(BottomSheet);
    const selectedOption = tree!.root.findByProps({ testID: 'app-select-option-BRL' });
    const disabledOption = tree!.root.findByProps({ testID: 'app-select-option-USD' });

    expect(bottomSheet.props.isPresented).toBe(true);
    expect(triggerButton().props.label).toBe('Brazilian real');
    expect(selectedOption.props.label).toBe('Brazilian real');
    expect(disabledOption.props.label).toBe('US dollar');

    act(() => {
      disabledOption.props.onPress();
    });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(bottomSheet.props.isPresented).toBe(true);
  });
});
