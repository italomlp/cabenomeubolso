import { useState } from 'react';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import {
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextStyle,
} from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import { Column, Text, TextInput } from './expo-ui';

type ExpoTextInputProps = ComponentPropsWithoutRef<typeof TextInput>;
const AccessibleTextInput = TextInput as unknown as ComponentType<ExpoTextInputProps & { accessibilityLabel?: string }>;

type AppTextFieldEvent = NativeSyntheticEvent<TextInputFocusEventData>;

export type AppTextFieldProps = ExpoTextInputProps & {
  helperText?: string;
  label: string;
  onBlur?: (event: AppTextFieldEvent) => void;
  onFocus?: (event: AppTextFieldEvent) => void;
  testID?: string;
};

export function AppTextField({ helperText, label, onBlur, onFocus, style, testID, ...props }: AppTextFieldProps) {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const labelStyle = {
    color: theme.colors.onSurface,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    lineHeight: theme.typography.label.lineHeight,
  } satisfies TextStyle;

  const helperStyle = {
    color: theme.colors.muted,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    lineHeight: theme.typography.body.lineHeight,
  } satisfies TextStyle;

  const handleBlur = ((event: AppTextFieldEvent) => {
    setIsFocused(false);
    onBlur?.(event);
  }) as ExpoTextInputProps['onBlur'];

  const handleFocus = ((event: AppTextFieldEvent) => {
    setIsFocused(true);
    onFocus?.(event);
  }) as ExpoTextInputProps['onFocus'];

  return (
    <Column spacing={theme.space.xs} style={styles.container}>
      <Text textStyle={labelStyle}>{label}</Text>
      <AccessibleTextInput
        accessibilityLabel={label}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={theme.colors.muted}
        style={{
          ...styles.input,
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: isFocused ? theme.colors.focus : theme.colors.border,
          height: theme.space.touchTarget,
          paddingHorizontal: theme.space.md,
          ...(StyleSheet.flatten(style) ?? {}),
        }}
        textStyle={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.body.fontSize,
          fontWeight: theme.typography.body.fontWeight,
          lineHeight: theme.typography.body.lineHeight,
        }}
        testID={testID}
        {...props}
      />
      {helperText ? <Text textStyle={helperStyle}>{helperText}</Text> : null}
    </Column>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
  },
} as const;
