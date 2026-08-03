import { useState } from 'react';

import { useAppTheme } from '@/design-system/theme-context';

import { AppButton } from './app-button';
import { AppSheet } from './app-sheet';
import { Column, Text } from './expo-ui';

export type AppSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type AppSelectProps = {
  helperText?: string;
  label: string;
  onValueChange: (value: string) => void;
  options: readonly AppSelectOption[];
  placeholder?: string;
  testID?: string;
  value: string | null | undefined;
};

export function AppSelect({ helperText, label, onValueChange, options, placeholder, testID, value }: AppSelectProps) {
  const theme = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const triggerLabel = selectedOption?.label ?? placeholder ?? label;

  return (
    <Column spacing={theme.space.xs} style={styles.container}>
      <Text
        textStyle={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.label.fontSize,
          fontWeight: theme.typography.label.fontWeight,
          lineHeight: theme.typography.label.lineHeight,
        }}
      >
        {label}
      </Text>
      <AppButton
        label={triggerLabel}
        onPress={() => setIsOpen(true)}
        style={{
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }}
        testID={testID}
        variant="secondary"
      />
      {helperText ? (
        <Text
          textStyle={{
            color: theme.colors.muted,
            fontSize: theme.typography.body.fontSize,
            fontWeight: theme.typography.body.fontWeight,
            lineHeight: theme.typography.body.lineHeight,
          }}
        >
          {helperText}
        </Text>
      ) : null}

      <AppSheet onClose={() => setIsOpen(false)} title={label} visible={isOpen}>
        <Column spacing={theme.space.sm}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <AppButton
                accessibilityLabel={option.label}
                accessibilitySelected={isSelected}
                disabled={option.disabled}
                key={option.value}
                label={option.label}
                onPress={() => {
                  if (option.disabled) {
                    return;
                  }

                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  backgroundColor: isSelected ? theme.colors.backgroundSelected : theme.colors.surfaceRaised,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  opacity: option.disabled ? 0.5 : 1,
                  paddingHorizontal: theme.space.md,
                  paddingVertical: theme.space.sm,
                }}
                testID={`app-select-option-${option.value}`}
                variant="secondary"
              />
            );
          })}
        </Column>
      </AppSheet>
    </Column>
  );
}

const styles = {
  container: {
    width: '100%',
  },
} as const;
