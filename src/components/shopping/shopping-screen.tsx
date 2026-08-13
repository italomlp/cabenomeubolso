import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/design-system/theme-context';
import { AppButton, AppColumn, AppRow, AppScreen, AppSheet, AppText, AppTextField, announceForAccessibility } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { calculateShoppingListTotals, type ShoppingList } from '@/domain/shopping-list';
import { ShoppingListFinalizeConfirmationRequiredError } from '@/domain/shopping-list-use-cases';
import { formatCurrencyMinor, formatQuantityMilli, parseCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { usePlanningRuntime, type PlanningRuntime } from '@/components/planning/planning-runtime';
import { BudgetRail } from './budget-rail';

type Props = { listId: string; dependencies?: PlanningRuntime; onSummary?: (id: string) => void };

export default function ShoppingScreen({ listId, dependencies, onSummary }: Props) {
  const theme = useAppTheme(); const { t } = useTranslation(undefined, { i18n }); const locale = i18n.resolvedLanguage ?? i18n.language;
  const runtime = usePlanningRuntime(dependencies); const [list, setList] = useState<ShoppingList | null>(null); const [editing, setEditing] = useState<string | null>(null); const [confirm, setConfirm] = useState(false); const [error, setError] = useState<string | null>(null);
  const price = useNativeState('');
  useEffect(() => { if (runtime) void runtime.useCases.loadList(listId).then(setList).catch(() => setError(t('shopping.loadError'))); }, [listId, runtime, t]);
  const totals = useMemo(() => list ? calculateShoppingListTotals(list) : null, [list]);
  const items = list?.items.filter((item) => item.deletedAt === null) ?? [];
  const purchase = async (itemId: string, text?: string) => { if (!runtime?.useCases.setItemPurchased || !list) return; try { const minor = text === undefined ? undefined : parseCurrencyMinor(locale, text, list.currencyCode); const next = await runtime.useCases.setItemPurchased(list.id, itemId, minor); setList(next); announceForAccessibility(t('shopping.purchasedAnnouncement')); } catch (caughtError) { setError(t('shopping.priceError')); throw caughtError; } };
  const finalize = async (withConfirmation: boolean) => { if (!runtime || !list) return; try { const next = await runtime.useCases.finalizeList(list.id, { confirmUnpurchased: withConfirmation }); setList(next); setConfirm(false); setError(null); onSummary?.(next.id); } catch (caughtError) { if (caughtError instanceof ShoppingListFinalizeConfirmationRequiredError) { setConfirm(true); } else { setError(t('shopping.loadError')); } } };
  if (!list || !totals) return <AppScreen><AppText>{error ?? t('app.loading')}</AppText></AppScreen>;
  const risk = totals.remainingMinor < 0;
  return <AppScreen contentStyle={{ paddingBottom: theme.space.xl }}>
    <AppColumn spacing={theme.space.md}>
      <AppColumn spacing={theme.space.xxs}><AppText textStyle={{ fontSize: theme.typography.title.fontSize, fontWeight: '700' }}>{list.name}</AppText><AppText>{t('shopping.activeLabel')}</AppText></AppColumn>
      <BudgetRail actualLabel={t('home.actualLabel')} budgetLabel={t('home.budgetLabel')} actual={formatCurrencyMinor(locale, totals.actualMinor, list.currencyCode)} budget={formatCurrencyMinor(locale, list.budgetMinor, list.currencyCode)} remaining={formatCurrencyMinor(locale, Math.abs(totals.remainingMinor), list.currencyCode)} risk={risk} status={risk ? t('shopping.overBy') : t('shopping.remaining')} />
      {items.map((item) => { const bought = item.purchasedAt !== null; const unit = t(`units.${item.unitCode}`); return <AppColumn key={item.id} spacing={theme.space.xs} style={{ borderColor: theme.colors.border, borderWidth: 1, padding: theme.space.sm }}>
        <AppRow spacing={theme.space.sm}><AppColumn spacing={0}><AppText textStyle={{ fontWeight: '600' }}>{item.name}</AppText><AppText>{`${formatQuantityMilli(locale, item.unitCode, item.quantityMilli)} ${unit} · ${formatCurrencyMinor(locale, bought && item.actualUnitMinor !== null ? item.actualUnitMinor : item.plannedUnitMinor, list.currencyCode)} / ${unit}`}</AppText></AppColumn><AppButton label={bought ? t('shopping.undo') : t('shopping.buy')} accessibilitySelected={bought} onPress={() => { if (bought) { void runtime?.useCases.setItemUnpurchased?.(list.id, item.id).then(setList).catch(() => setError(t('shopping.loadError'))); } else { setEditing(item.id); price.set(item.actualUnitMinor === null ? formatCurrencyMinor(locale, item.plannedUnitMinor, list.currencyCode) : formatCurrencyMinor(locale, item.actualUnitMinor, list.currencyCode)); } }} testID={`purchase-${item.id}`} variant={bought ? 'secondary' : 'primary'} /></AppRow>
      </AppColumn>; })}
      <AppButton label={t('shopping.finalize')} onPress={() => void finalize(false)} accessibilityHint={t('shopping.finalizeHint')} testID="finalize-shopping" />
      {error ? <AppText>{error}</AppText> : null}
    </AppColumn>
    <AppSheet visible={editing !== null} title={t('shopping.actualTitle')} onClose={() => setEditing(null)}><AppColumn spacing={theme.space.md}><AppText>{t('shopping.actualHint')}</AppText><AppTextField label={t('shopping.actualPrice')} value={price} onChangeText={(value) => price.set(value)} keyboardType="decimal-pad" inputMode="decimal" /><AppButton label={t('shopping.saveActual')} onPress={() => { if (editing) void purchase(editing, price.value).then(() => setEditing(null)); }} /></AppColumn></AppSheet>
    <AppSheet visible={confirm} title={t('shopping.confirmTitle')} onClose={() => setConfirm(false)}><AppColumn spacing={theme.space.md}><AppText>{t('shopping.confirmBody')}</AppText><AppRow spacing={theme.space.sm}><AppButton label={t('shopping.cancel')} onPress={() => setConfirm(false)} variant="secondary" /><AppButton label={t('shopping.confirm')} onPress={() => void finalize(true)} /></AppRow></AppColumn></AppSheet>
  </AppScreen>;
}
