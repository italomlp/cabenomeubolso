import { useAppTheme } from '@/design-system/theme-context';

import { AppColumn, AppRow, AppText } from '@/components/ui';

type BudgetSummaryProps = {
  accentColor?: string;
  body: string;
  budgetLabel: string;
  budgetValue: string;
  remainingLabel?: string;
  remainingValue?: string;
  actualLabel?: string;
  actualValue?: string;
  listLabel?: string;
  listValue?: string;
  title: string;
  statusLabel?: string;
  statusIcon?: string;
};

export function BudgetSummary({ accentColor, actualLabel, actualValue, body, budgetLabel, budgetValue, listLabel, listValue, remainingLabel, remainingValue, statusIcon = '•', statusLabel, title }: BudgetSummaryProps) {
  const theme = useAppTheme();

  return (
    <AppColumn
      spacing={theme.space.sm}
      style={{
        backgroundColor: theme.colors.surfaceRaised,
        borderRadius: theme.radius.lg,
        borderColor: accentColor ?? theme.colors.budgetNeutral,
        borderWidth: 2,
        padding: theme.space.lg,
      }}
    >
      <AppRow spacing={theme.space.sm}>
        <AppText
          textStyle={{
            color: accentColor ?? theme.colors.budgetNeutral,
            fontSize: theme.typography.title.fontSize,
            fontWeight: theme.typography.title.fontWeight,
            lineHeight: theme.typography.title.lineHeight,
          }}
        >
          {statusIcon}
        </AppText>
        <AppText
        textStyle={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.title.fontSize,
          fontWeight: theme.typography.title.fontWeight,
          lineHeight: theme.typography.title.lineHeight,
        }}
      >
        {title}
        </AppText>
      </AppRow>
      <AppText
        textStyle={{
          color: theme.colors.muted,
          fontSize: theme.typography.body.fontSize,
          fontWeight: theme.typography.body.fontWeight,
          lineHeight: theme.typography.body.lineHeight,
        }}
      >
        {body}
      </AppText>
      {statusLabel ? (
        <AppText
          textStyle={{
            color: accentColor ?? theme.colors.budgetNeutral,
            fontSize: theme.typography.label.fontSize,
            fontWeight: theme.typography.label.fontWeight,
            lineHeight: theme.typography.label.lineHeight,
          }}
        >
          {statusLabel}
        </AppText>
      ) : null}
      <AppColumn spacing={theme.space.lg}>
        <AppColumn spacing={theme.space.xxs}>
          <AppText
            textStyle={{
              color: theme.colors.muted,
              fontSize: theme.typography.label.fontSize,
              fontWeight: theme.typography.label.fontWeight,
              lineHeight: theme.typography.label.lineHeight,
            }}
          >
            {remainingLabel ?? listLabel}
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.display.fontSize,
              fontWeight: theme.typography.display.fontWeight,
              lineHeight: theme.typography.display.lineHeight,
            }}
          >
            {remainingValue ?? listValue}
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
            {actualLabel ?? budgetLabel}
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.display.fontSize,
              fontWeight: theme.typography.display.fontWeight,
              lineHeight: theme.typography.display.lineHeight,
            }}
          >
            {actualValue ?? budgetValue}
          </AppText>
        </AppColumn>
      </AppColumn>
    </AppColumn>
  );
}
