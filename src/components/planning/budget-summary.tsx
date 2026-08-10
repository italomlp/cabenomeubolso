import { useAppTheme } from '@/design-system/theme-context';

import { AppColumn, AppRow, AppText } from '@/components/ui';

type BudgetSummaryProps = {
  accentColor: string;
  body: string;
  budgetLabel: string;
  budgetValue: string;
  listLabel: string;
  listValue: string;
  title: string;
};

export function BudgetSummary({ accentColor, body, budgetLabel, budgetValue, listLabel, listValue, title }: BudgetSummaryProps) {
  const theme = useAppTheme();

  return (
    <AppColumn
      spacing={theme.space.sm}
      style={{
        backgroundColor: theme.colors.surfaceRaised,
        borderColor: accentColor,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        padding: theme.space.md,
      }}
    >
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
      <AppRow spacing={theme.space.lg}>
        <AppColumn spacing={theme.space.xxs}>
          <AppText
            textStyle={{
              color: theme.colors.muted,
              fontSize: theme.typography.label.fontSize,
              fontWeight: theme.typography.label.fontWeight,
              lineHeight: theme.typography.label.lineHeight,
            }}
          >
            {listLabel}
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.display.fontSize,
              fontWeight: theme.typography.display.fontWeight,
              lineHeight: theme.typography.display.lineHeight,
            }}
          >
            {listValue}
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
            {budgetLabel}
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.numeric.fontSize,
              fontWeight: theme.typography.numeric.fontWeight,
              lineHeight: theme.typography.numeric.lineHeight,
            }}
          >
            {budgetValue}
          </AppText>
        </AppColumn>
      </AppRow>
    </AppColumn>
  );
}
