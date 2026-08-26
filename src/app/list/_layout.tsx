import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router/stack';

import { i18n } from '@/lib/localization/i18n';

export default function ListStackLayout() {
  const { t } = useTranslation(undefined, { i18n });

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="new" options={{ title: t('createList.title') }} />
      <Stack.Screen name="[id]" options={{ title: t('listDetail.title') }} />
    </Stack>
  );
}
