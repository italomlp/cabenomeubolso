import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/design-system/theme-context';
import { i18n } from '@/lib/localization/i18n';

import { AppButton } from './app-button';
import { AppColumn } from './app-column';
import { AppRow } from './app-row';
import { AppText } from './app-text';

type AppUndoNoticeProps = {
  message: string;
  onUndo: () => void;
  visible: boolean;
};

export function AppUndoNotice({ message, onUndo, visible }: AppUndoNoticeProps) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });

  if (!visible) {
    return null;
  }

  return (
    <AppRow
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
            fontSize: theme.typography.body.fontSize,
            fontWeight: theme.typography.body.fontWeight,
            lineHeight: theme.typography.body.lineHeight,
          }}
        >
          {message}
        </AppText>
      </AppColumn>
      <AppButton accessibilityHint={t('feedback.undoHint')} label={t('feedback.undo')} onPress={onUndo} testID="home-undo" variant="secondary" />
    </AppRow>
  );
}
