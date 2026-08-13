import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppScreen, AppText } from '@/components/ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import { calculateShoppingListTotals, type ShoppingList } from '@/domain/shopping-list';
import { formatCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';

import { AppEmptyState } from './app-empty-state';
import { BudgetSummary } from './budget-summary';
import { ListCard } from './list-card';
import type { PlanningRuntime } from './planning-runtime';
import { usePlanningRuntime } from './planning-runtime';

type HomeScreenProps = {
  dependencies?: PlanningRuntime;
  onOpenList?: (listId: string) => void;
  onOpenNewList?: () => void;
};

export default function HomeScreen({ dependencies, onOpenList, onOpenNewList }: HomeScreenProps = {}) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const runtime = usePlanningRuntime(dependencies);
  const [lists, setLists] = useState<readonly ShoppingList[]>([]);
  const [errorKind, setErrorKind] = useState<'finalize' | 'load' | null>(null);
  const [failedFinalizeListId, setFailedFinalizeListId] = useState<string | null>(null);

  const refreshLists = useCallback(async () => {
    if (runtime === null) {
      return;
    }

    try {
      const nextLists = await runtime.repository.list();
      setLists(nextLists);
      setErrorKind(null);
    } catch {
      setErrorKind('load');
    }
  }, [runtime]);

  useEffect(() => {
    let isActive = true;

    if (runtime !== null) {
      queueMicrotask(() => {
        void refreshLists().catch(() => {
          if (isActive) {
            setErrorKind('load');
          }
        });
      });
    }

    return () => {
      isActive = false;
    };
  }, [refreshLists, runtime]);

  const finalizeList = async (listId: string) => {
    if (runtime === null) {
      return;
    }

    try {
      await runtime.useCases.finalizeList(listId, { confirmUnpurchased: true });
      await refreshLists();
      setFailedFinalizeListId(null);
    } catch {
      setErrorKind('finalize');
      setFailedFinalizeListId(listId);
    }
  };

  const summaryByCurrency = useMemo(() => {
    const grouped = new Map<SupportedCurrency, { active: { budget: number; actual: number; remaining: number }; finalized: { budget: number; actual: number; remaining: number } }>();
    for (const list of lists) {
      if (list.deletedAt !== null) continue;
      const bucket = list.status === 'finalized' ? 'finalized' : 'active';
      const totals = calculateShoppingListTotals(list);
      const current = grouped.get(list.currencyCode) ?? { active: { budget: 0, actual: 0, remaining: 0 }, finalized: { budget: 0, actual: 0, remaining: 0 } };
      current[bucket].budget += list.budgetMinor;
      current[bucket].actual += totals.actualMinor;
      current[bucket].remaining += totals.remainingMinor;
      grouped.set(list.currencyCode, current);
    }
    return grouped;
  }, [lists]);

  if (runtime === null) {
    return (
      <AppScreen>
        <AppColumn spacing={theme.space.lg} style={{ backgroundColor: theme.colors.surface, padding: theme.space.content }}>
          <AppText>{t('app.loading')}</AppText>
        </AppColumn>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppColumn spacing={theme.space.lg} style={{ backgroundColor: theme.colors.surface, padding: theme.space.content }}>
        <AppColumn spacing={theme.space.xs}>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.display.fontSize,
              fontWeight: theme.typography.display.fontWeight,
              lineHeight: theme.typography.display.lineHeight,
            }}
          >
            {t('home.title')}
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.muted,
              fontSize: theme.typography.body.fontSize,
              fontWeight: theme.typography.body.fontWeight,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            {t('home.subtitle')}
          </AppText>
        </AppColumn>

        <AppColumn spacing={theme.space.md}>
          {[...summaryByCurrency.entries()].map(([currencyCode, totals]) => (
            <AppColumn key={currencyCode} spacing={theme.space.sm}>
              <AppText>{t('home.currencySummaryTitle', { currency: currencyCode === 'USD' ? t('preferences.currencyUsd') : t('preferences.currencyBrl') })}</AppText>
              <BudgetSummary accentColor={theme.colors.budgetSafe} actualLabel={t('home.actualLabel')} actualValue={formatCurrencyMinor(locale, totals.active.actual, currencyCode)} body={t('home.activeSummaryBody')} budgetLabel={t('home.budgetLabel')} budgetValue={formatCurrencyMinor(locale, totals.active.budget, currencyCode)} title={t('home.activeSummaryTitle')} />
              <BudgetSummary accentColor={theme.colors.budgetNeutral} actualLabel={t('home.actualLabel')} actualValue={formatCurrencyMinor(locale, totals.finalized.actual, currencyCode)} body={t('home.finalizedSummaryBody')} budgetLabel={t('home.budgetLabel')} budgetValue={formatCurrencyMinor(locale, totals.finalized.budget, currencyCode)} title={t('home.finalizedSummaryTitle')} />
            </AppColumn>
          ))}
        </AppColumn>

        <AppButton accessibilityHint={t('home.openCreateListHint')} label={t('home.openCreateList')} onPress={() => onOpenNewList?.()} style={{ alignSelf: 'flex-start' }} testID="home-primary-create" />

        {errorKind !== null ? (
          <AppColumn spacing={theme.space.sm}>
            <AppText>{t(errorKind === 'load' ? 'home.loadError' : 'home.finalizeError')}</AppText>
            <AppButton
              accessibilityHint={t('home.retry')}
              label={t('home.retry')}
              onPress={() => {
                if (errorKind === 'load') {
                  void refreshLists();
                } else if (failedFinalizeListId !== null) {
                  void finalizeList(failedFinalizeListId);
                }
              }}
              testID="home-retry"
              variant="secondary"
            />
          </AppColumn>
        ) : null}

        {lists.length === 0 ? (
          <AppEmptyState
            actionLabel={t('home.emptyAction')}
            body={t('home.emptyBody')}
            onAction={() => onOpenNewList?.()}
            title={t('home.emptyTitle')}
          />
        ) : (
          <AppColumn spacing={theme.space.md}>
            {lists.map((list) => (
              <ListCard
                budgetLabel={t('home.activeSummaryBudgetLabel')}
                currencyLabel={t('createList.summaryCurrencyLabel')}
                editLabel={t('home.editList')}
                finalizeLabel={t('createList.finalize')}
                key={list.id}
                list={list}
                onFinalize={(listId) => void finalizeList(listId)}
                onLoad={(entry) => onOpenList?.(entry.id)}
                onReopenAndEdit={(listId) => onOpenList?.(listId)}
                resolveBudget={(entry) => formatCurrencyMinor(locale, entry.budgetMinor, entry.currencyCode)}
                resolveCurrency={(currencyCode: SupportedCurrency) => (currencyCode === 'USD' ? t('preferences.currencyUsd') : t('preferences.currencyBrl'))}
                reopenLabel={t('home.reopenList')}
                statusLabel={
                  list.status === 'finalized'
                    ? t('home.listStatusFinalized')
                    : list.status === 'active'
                      ? t('home.listStatusActive')
                      : t('home.listStatusDraft')
                }
              />
            ))}
          </AppColumn>
        )}
      </AppColumn>
    </AppScreen>
  );
}
