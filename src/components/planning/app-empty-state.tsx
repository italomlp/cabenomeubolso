import { useAppTheme } from '@/design-system/theme-context';

import { AppButton, AppColumn, AppText } from '@/components/ui';

type AppEmptyStateProps = {
  actionLabel: string;
  body: string;
  onAction: () => void;
  title: string;
};

export function AppEmptyState({ actionLabel, body, onAction, title }: AppEmptyStateProps) {
  const theme = useAppTheme();

  return (
    <AppColumn
      spacing={theme.space.md}
      style={{
        backgroundColor: theme.colors.surfaceRaised,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        padding: theme.space.md,
      }}
    >
      <AppColumn spacing={theme.space.xxs}>
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
      </AppColumn>
      <AppButton accessibilityHint={actionLabel} label={actionLabel} onPress={onAction} />
    </AppColumn>
  );
}
