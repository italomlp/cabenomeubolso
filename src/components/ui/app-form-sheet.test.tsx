import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { AppThemeProvider } from '@/design-system/theme-context';

import * as mockExpoUi from './expo-ui.mock';
import { BottomSheet, Button, ScrollView } from './expo-ui';
import { AppFormSheet } from './app-form-sheet';

jest.mock('./expo-ui', () => mockExpoUi);

describe('AppFormSheet', () => {
  it('keeps save and cancel outside the scrollable body', () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AppThemeProvider systemScheme="light" themePreference="system">
          <AppFormSheet
            cancelLabel="Cancel"
            onCancel={onCancel}
            onSave={onSave}
            saveLabel="Save"
            title="Sheet"
            visible
          >
            <Text testID="body">Body</Text>
          </AppFormSheet>
        </AppThemeProvider>
      );
    });

    const sheet = tree!.root.findByType(BottomSheet);
    const scrollView = tree!.root.findByType(ScrollView);
    const cancelButton = tree!.root.findAllByType(Button).find((button) => button.props.label === 'Cancel')!;
    const saveButton = tree!.root.findAllByType(Button).find((button) => button.props.label === 'Save')!;
    const scrollViewChildren = scrollView.props.children;

    expect(sheet.props.isPresented).toBe(true);
    expect(scrollView.props.keyboardDismissMode).toBe('interactive');
    expect(scrollViewChildren.props.children.props.testID).toBe('body');
    expect(tree!.root.findByProps({ testID: 'body' })).toBeTruthy();
    expect(tree!.root.findAllByType(Button).map((button) => button.props.label)).toEqual(['Cancel', 'Save']);

    act(() => {
      cancelButton.props.onPress();
      saveButton.props.onPress();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
