import type { ReactNode } from 'react';

import { useAppTheme } from '@/design-system/theme-context';

import { AppColumn, AppRow, AppText } from '@/components/ui';

type GroceryItemRowProps = {
  actualLabel?: string;
  actualValue?: string;
  leading?: ReactNode;
  plannedLabel: string;
  plannedValue: string;
  quantityLabel: string;
  title: string;
};

export function GroceryItemRow({ actualLabel, actualValue, leading, plannedLabel, plannedValue, quantityLabel, title }: GroceryItemRowProps) {
  const theme = useAppTheme();

  return (
    <AppRow
      spacing={theme.space.md}
      style={{
        backgroundColor: theme.colors.backgroundElement,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        padding: theme.space.md,
      }}
    >
      {leading}
      <AppColumn spacing={theme.space.xxs}>
        <AppText
          textStyle={{
            color: theme.colors.onSurface,
            fontSize: theme.typography.body.fontSize,
            fontWeight: theme.typography.body.fontWeight,
            lineHeight: theme.typography.body.lineHeight,
          }}
        >
          {title}
        </AppText>
        <AppText
          textStyle={{
            color: theme.colors.muted,
            fontSize: theme.typography.label.fontSize,
            fontWeight: theme.typography.label.fontWeight,
            lineHeight: theme.typography.label.lineHeight,
          }}
        >
          {quantityLabel}
        </AppText>
      </AppColumn>
      <AppColumn spacing={theme.space.xxs}>
        <AppText
          textStyle={{
            color: theme.colors.muted,
            fontSize: theme.typography.label.fontSize,
            fontWeight: theme.typography.label.fontWeight,
            lineHeight: theme.typography.label.lineHeight,
          }}
        >
          {plannedLabel}
        </AppText>
        <AppText
          textStyle={{
            color: theme.colors.onSurface,
            fontSize: theme.typography.numeric.fontSize,
            fontWeight: theme.typography.numeric.fontWeight,
            lineHeight: theme.typography.numeric.lineHeight,
          }}
        >
          {plannedValue}
        </AppText>
        {actualLabel && actualValue ? (
          <>
            <AppText
              textStyle={{
                color: theme.colors.muted,
                fontSize: theme.typography.label.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                lineHeight: theme.typography.label.lineHeight,
              }}
            >
              {actualLabel}
            </AppText>
            <AppText
              textStyle={{
                color: theme.colors.onSurface,
                fontSize: theme.typography.numeric.fontSize,
                fontWeight: theme.typography.numeric.fontWeight,
                lineHeight: theme.typography.numeric.lineHeight,
              }}
            >
              {actualValue}
            </AppText>
          </>
        ) : null}
      </AppColumn>
    </AppRow>
  );
}
