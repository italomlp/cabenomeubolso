import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppScreen, AppText } from '@/components/ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingList } from '@/domain/shopping-list';
import { formatCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';

import { AppEmptyState } from './app-empty-state';
import { BudgetSummary } from './budget-summary';
import { ListCard } from './list-card';
import { FinalizeConfirmation } from './finalize-confirmation';
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
  const [pendingFinalizeListId, setPendingFinalizeListId] = useState<string | null>(null);

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
      await runtime.useCases.finalizeList(listId);
      await refreshLists();
      setFailedFinalizeListId(null);
    } catch {
      setErrorKind('finalize');
      setFailedFinalizeListId(listId);
    }
  };

  const requestFinalize = (listId: string) => {
    const list = lists.find((entry) => entry.id === listId);
    if (list?.items.some((item) => item.deletedAt === null && item.purchasedAt === null)) {
      setPendingFinalizeListId(listId);
      return;
    }

    void finalizeList(listId);
  };

  const summaryLists = useMemo(
    () => ({
      active: lists.filter((list) => list.status !== 'finalized' && list.deletedAt === null),
      finalized: lists.filter((list) => list.status === 'finalized' && list.deletedAt === null),
    }),
    [lists]
  );

  const summaryByCurrency = useMemo(() => {
    const grouped = new Map<SupportedCurrency, { active: number; finalized: number }>();
    for (const list of lists) {
      if (list.deletedAt !== null) continue;
      const current = grouped.get(list.currencyCode) ?? { active: 0, finalized: 0 };
      current[list.status === 'finalized' ? 'finalized' : 'active'] += list.budgetMinor;
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
              <BudgetSummary
                accentColor={theme.colors.budgetSafe}
                body={t('home.activeSummaryBody')}
                budgetLabel={t('home.activeSummaryBudgetLabel')}
                budgetValue={formatCurrencyMinor(locale, totals.active, currencyCode)}
                listLabel={t('home.activeSummaryListsLabel')}
                listValue={String(summaryLists.active.filter((list) => list.currencyCode === currencyCode).length)}
                title={t('home.activeSummaryTitle')}
              />
              <BudgetSummary
                accentColor={theme.colors.budgetNeutral}
                body={t('home.finalizedSummaryBody')}
                budgetLabel={t('home.finalizedSummaryBudgetLabel')}
                budgetValue={formatCurrencyMinor(locale, totals.finalized, currencyCode)}
                listLabel={t('home.finalizedSummaryListsLabel')}
                listValue={String(summaryLists.finalized.filter((list) => list.currencyCode === currencyCode).length)}
                title={t('home.finalizedSummaryTitle')}
              />
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
                onFinalize={requestFinalize}
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
      <FinalizeConfirmation
        cancelHint={t('home.finalizeCancelHint')}
        cancelLabel={t('home.finalizeCancel')}
        confirmHint={t('home.finalizeConfirmHint')}
        confirmLabel={t('home.finalizeConfirm')}
        message={t('home.finalizeUnpurchasedMessage')}
        title={t('home.finalizeConfirmationTitle')}
        visible={pendingFinalizeListId !== null}
        onCancel={() => setPendingFinalizeListId(null)}
        onConfirm={() => {
          const listId = pendingFinalizeListId;
          setPendingFinalizeListId(null);
          if (listId !== null) void finalizeList(listId);
        }}
      />
    </AppScreen>
  );
}
