import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import {
  accessibilityHint as accessibilityHintModifier,
  accessibilityLabel as accessibilityLabelModifier,
} from '@expo/ui/swift-ui/modifiers';

import { useAppTheme } from '@/design-system/theme-context';

import { Column, Text, TextInput } from './expo-ui';

type ExpoTextInputProps = ComponentPropsWithoutRef<typeof TextInput>;

export type AppTextFieldProps = Omit<ExpoTextInputProps, 'modifiers'> & {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  helperText?: string;
  label: string;
  onBlur?: () => void;
  onFocus?: () => void;
  testID?: string;
};

export function AppTextField({
  accessibilityHint,
  accessibilityLabel,
  helperText,
  label,
  onBlur,
  onFocus,
  style,
  testID,
  ...props
}: AppTextFieldProps) {
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

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  return (
    <Column spacing={theme.space.xs} style={styles.container}>
      <Text textStyle={labelStyle}>{label}</Text>
      <TextInput
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={theme.colors.placeholder}
        modifiers={[
          accessibilityLabelModifier(accessibilityLabel ?? label),
          ...(accessibilityHint ?? helperText ? [accessibilityHintModifier(accessibilityHint ?? helperText!)] : []),
        ]}
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
  input: { borderWidth: 1 },
} as const;
