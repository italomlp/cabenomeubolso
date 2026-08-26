import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { i18n } from '@/lib/localization/i18n';

export default function PrimaryTabsLayout() {
  const { t } = useTranslation(undefined, { i18n });

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: t('home.title') }} />
    </Tabs>
  );
}
