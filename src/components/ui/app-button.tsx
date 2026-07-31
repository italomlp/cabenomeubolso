import type { ComponentPropsWithoutRef } from 'react';
import { StyleSheet, type AccessibilityProps, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import { Button } from './expo-ui';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

type ExpoButtonProps = ComponentPropsWithoutRef<typeof Button>;

export type AppButtonProps = Omit<ExpoButtonProps, 'children' | 'label' | 'style' | 'variant'> & {
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
} & Pick<AccessibilityProps, 'accessibilityLabel' | 'accessibilityValue'>;

export function AppButton({ disabled, label, style, variant = 'primary', ...props }: AppButtonProps) {
  const theme = useAppTheme();
  const buttonStyle = {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    ...(variant === 'primary' ? { backgroundColor: theme.colors.focus } : {}),
    ...(variant === 'secondary'
      ? {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }
      : {}),
    ...(variant === 'ghost' ? { backgroundColor: 'transparent' } : {}),
    ...(disabled ? { opacity: 0.55 } : {}),
    ...(StyleSheet.flatten(style) ?? {}),
  };

  return (
    <Button
      disabled={disabled}
      label={label}
      style={buttonStyle}
      variant={variant === 'primary' ? 'filled' : variant === 'secondary' ? 'outlined' : 'text'}
      {...props}
    />
  );
}
