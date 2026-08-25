import type { ComponentPropsWithoutRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  accessibilityHint as accessibilityHintModifier,
  accessibilityLabel as accessibilityLabelModifier,
  accessibilityAddTraits,
} from '@expo/ui/swift-ui/modifiers';

import { useAppTheme } from '@/design-system/theme-context';

import { Button } from './expo-ui';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ExpoButtonProps = ComponentPropsWithoutRef<typeof Button>;

export type AppButtonProps = Omit<ExpoButtonProps, 'children' | 'label' | 'modifiers' | 'style' | 'variant'> & {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilitySelected?: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

export function AppButton({
  accessibilityHint,
  accessibilityLabel,
  accessibilitySelected = false,
  disabled,
  label,
  style,
  variant = 'primary',
  ...props
}: AppButtonProps) {
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
    ...(variant === 'destructive' ? { backgroundColor: theme.colors.budgetRisk } : {}),
    ...(variant === 'ghost' ? { backgroundColor: 'transparent' } : {}),
    ...(disabled ? { opacity: 0.55 } : {}),
    ...(StyleSheet.flatten(style) ?? {}),
  };

  return (
    <Button
      disabled={disabled}
      label={label}
      modifiers={[
        accessibilityLabelModifier(accessibilityLabel ?? label),
        ...(accessibilityHint ? [accessibilityHintModifier(accessibilityHint)] : []),
        ...(accessibilitySelected ? [accessibilityAddTraits(['isSelected'])] : []),
      ]}
      style={buttonStyle}
      variant={variant === 'primary' || variant === 'destructive' ? 'filled' : variant === 'secondary' ? 'outlined' : 'text'}
      {...props}
    />
  );
}
