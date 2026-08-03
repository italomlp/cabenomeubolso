import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppHost, AppRow, AppSelect, AppSheet, AppText, AppTextField } from '@/components/ui';
import { useAppTheme } from '@/design-system/theme-context';
import { i18n } from '@/lib/localization/i18n';

export default function HomeScreen() {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const [currency, setCurrency] = useState('BRL');
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const currencyOptions = [
    { label: t('preferences.currencyBrl'), value: 'BRL' },
    { label: t('preferences.currencyUsd'), value: 'USD' },
  ];

  return (
    <AppHost>
      <AppColumn spacing={theme.space.lg} style={{ padding: theme.space.content, backgroundColor: theme.colors.surface }}>
        <AppColumn spacing={theme.space.xs}>
          <AppText
            textStyle={{
              ...theme.typography.title,
              color: theme.colors.onSurface,
            }}
          >
            {t('app.readyTitle')}
          </AppText>
          <AppText
            textStyle={{
              ...theme.typography.body,
              color: theme.colors.muted,
            }}
          >
            {t('app.designPreviewBody')}
          </AppText>
        </AppColumn>

        <AppTextField
          helperText={t('form.searchHelper')}
          label={t('form.searchLabel')}
          placeholder={t('form.searchPlaceholder')}
        />

        <AppSelect
          helperText={t('app.readyBody')}
          label={t('form.currencyLabel')}
          onValueChange={setCurrency}
          options={currencyOptions}
          placeholder={t('preferences.currencySystem')}
          value={currency}
        />

        <AppRow spacing={theme.space.sm}>
          <AppButton label={t('form.openSheet')} onPress={() => setIsSheetVisible(true)} />
          <AppButton disabled label={t('app.designPreviewTitle')} variant="secondary" />
        </AppRow>

        <AppSheet
          onClose={() => setIsSheetVisible(false)}
          title={t('app.designPreviewTitle')}
          visible={isSheetVisible}
        >
          <AppText
            textStyle={{
              ...theme.typography.body,
              color: theme.colors.onSurface,
            }}
          >
            {t('app.designPreviewBody')}
          </AppText>
        </AppSheet>
      </AppColumn>
    </AppHost>
  );
}
