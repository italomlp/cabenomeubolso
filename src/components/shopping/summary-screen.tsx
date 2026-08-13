import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppButton, AppColumn, AppScreen, AppText, AppTextField } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import { calculateShoppingListTotals, type ShoppingList } from '@/domain/shopping-list';
import { formatCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { usePlanningRuntime, type PlanningRuntime } from '@/components/planning/planning-runtime';
import { BudgetRail } from './budget-rail';

type Props = { listId: string; dependencies?: PlanningRuntime; onCloned?: (id: string) => void };

export default function SummaryScreen({ listId, dependencies, onCloned }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const runtime = usePlanningRuntime(dependencies);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cloneName = useNativeState('');

  useEffect(() => {
    if (runtime) void runtime.useCases.loadList(listId).then(setList).catch(() => setError(t('shopping.loadError')));
  }, [listId, runtime, t]);

  const totals = useMemo(() => list ? calculateShoppingListTotals(list) : null, [list]);
  if (!list || !totals) return <AppScreen><AppText>{error ?? t('app.loading')}</AppText></AppScreen>;
  const unpurchased = list.items.filter((item) => item.deletedAt === null && item.purchasedAt === null);

  return <AppScreen><AppColumn spacing={theme.space.md}>
    <AppText textStyle={{ fontSize: theme.typography.title.fontSize, fontWeight: '700' }}>{t('summary.title')}</AppText>
    <AppText>{list.name}</AppText>
    <BudgetRail actualLabel={t('home.actualLabel')} budgetLabel={t('home.budgetLabel')} actual={formatCurrencyMinor(locale, totals.actualMinor, list.currencyCode)} budget={formatCurrencyMinor(locale, list.budgetMinor, list.currencyCode)} remaining={formatCurrencyMinor(locale, Math.abs(totals.remainingMinor), list.currencyCode)} risk={totals.remainingMinor < 0} status={totals.remainingMinor < 0 ? t('shopping.overBy') : t('shopping.remaining')} />
    <AppText textStyle={{ fontWeight: '700' }}>{t('summary.purchased')}</AppText>
    {list.items.filter((i) => i.deletedAt === null && i.purchasedAt !== null).map((i) => <AppText key={i.id}>{`✓ ${i.name}`}</AppText>)}
    {unpurchased.length ? <><AppText textStyle={{ fontWeight: '700' }}>{t('summary.unpurchased')}</AppText>{unpurchased.map((i) => <AppText key={i.id}>{`○ ${i.name}`}</AppText>)}</> : null}
    {error ? <AppText>{error}</AppText> : null}
    <AppTextField label={t('summary.cloneName')} value={cloneName} onChangeText={(value) => cloneName.set(value)} />
    <AppButton label={t('summary.clone')} onPress={async () => { if (!runtime?.useCases.cloneList) return; try { const cloned = await runtime.useCases.cloneList(list.id, cloneName.value.trim() || undefined); setError(null); onCloned?.(cloned.id); } catch { setError(t('shopping.loadError')); } }} />
  </AppColumn></AppScreen>;
}
