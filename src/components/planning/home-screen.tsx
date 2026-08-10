import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { AppButton, AppColumn, AppHost, AppRow, AppText } from '@/components/ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingList } from '@/domain/shopping-list';
import { formatCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';

import { resolveCreateListCurrency } from '@/app/home-state';

import type { PlanningRuntime } from './planning-runtime';
import { usePlanningRuntime } from './planning-runtime';

type HomeScreenProps = {
  dependencies?: PlanningRuntime;
  onOpenList?: (listId: string) => void;
  onOpenNewList?: () => void;
};

type SummaryCardProps = {
  accentColor: string;
  budgetLabel: string;
  budgetValue: string;
  body: string;
  listLabel: string;
  listValue: string;
  title: string;
};

type PersistedListCardProps = {
  budgetLabel: string;
  currencyLabel: string;
  editLabel: string;
  finalizeLabel: string;
  list: ShoppingList;
  onFinalize: (listId: string) => void;
  onLoad: (list: ShoppingList) => void;
  onReopenAndEdit: (listId: string) => void;
  resolveBudget: (list: ShoppingList) => string;
  resolveCurrency: (currencyCode: SupportedCurrency) => string;
  reopenLabel: string;
  statusLabel: string;
};

function SummaryCard({ accentColor, budgetLabel, budgetValue, body, listLabel, listValue, title }: SummaryCardProps) {
  const theme = useAppTheme();

  return (
    <AppColumn
      spacing={theme.space.sm}
      style={{
        ...styles.summaryCard,
        backgroundColor: theme.colors.surfaceRaised,
        borderColor: accentColor,
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

function PersistedListCard({
  budgetLabel,
  currencyLabel,
  editLabel,
  finalizeLabel,
  list,
  onFinalize,
  onLoad,
  onReopenAndEdit,
  resolveBudget,
  resolveCurrency,
  reopenLabel,
  statusLabel,
}: PersistedListCardProps) {
  const theme = useAppTheme();
  const visibleItemCount = list.items.filter((item) => item.deletedAt === null).length;
  const currencyText = resolveCurrency(list.currencyCode);
  const statusText = statusLabel;
  const actionLabel = list.status === 'finalized' ? reopenLabel : editLabel;

  return (
    <AppColumn
      spacing={theme.space.sm}
      style={{
        ...styles.listCard,
        backgroundColor: theme.colors.backgroundElement,
        borderColor: theme.colors.border,
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
          {list.name}
        </AppText>
        <AppText
          textStyle={{
            color: theme.colors.muted,
            fontSize: theme.typography.body.fontSize,
            fontWeight: theme.typography.body.fontWeight,
            lineHeight: theme.typography.body.lineHeight,
          }}
        >
          {statusText}
        </AppText>
      </AppColumn>

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
            {currencyLabel}
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.body.fontSize,
              fontWeight: theme.typography.body.fontWeight,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            {currencyText}
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
            {resolveBudget(list)}
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
            Items
          </AppText>
          <AppText
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.body.fontSize,
              fontWeight: theme.typography.body.fontWeight,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            {String(visibleItemCount)}
          </AppText>
        </AppColumn>
      </AppRow>

      <AppRow spacing={theme.space.sm}>
        <AppButton
          label={actionLabel}
          onPress={() => (list.status === 'finalized' ? onReopenAndEdit(list.id) : onLoad(list))}
          testID={`load-${list.id}`}
          variant="secondary"
        />
        {list.status !== 'finalized' ? (
          <AppButton label={finalizeLabel} onPress={() => onFinalize(list.id)} testID={`finalize-${list.id}`} />
        ) : null}
      </AppRow>
    </AppColumn>
  );
}

export default function HomeScreen({ dependencies, onOpenList, onOpenNewList }: HomeScreenProps = {}) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const currencyPreference = useLocalizationPreferencesStore((state) => state.currencyPreference);
  const languagePreference = useLocalizationPreferencesStore((state) => state.languagePreference);
  const runtime = usePlanningRuntime(dependencies);
  const [lists, setLists] = useState<readonly ShoppingList[]>([]);

  const resolvedLocales = getLocales();
  const resolvedCurrency = useMemo(
    () => resolveCreateListCurrency({ currencyPreference, languagePreference }, resolvedLocales),
    [currencyPreference, languagePreference, resolvedLocales]
  );

  useEffect(() => {
    if (runtime === null) {
      return;
    }

    let isActive = true;

    void runtime.repository.list().then((nextLists) => {
      if (isActive) {
        setLists(nextLists);
      }
    });

    return () => {
      isActive = false;
    };
  }, [runtime]);

  const refreshLists = async () => {
    if (runtime === null) {
      return;
    }

    setLists(await runtime.repository.list());
  };

  const finalizeList = async (listId: string) => {
    if (runtime === null) {
      return;
    }

    await runtime.useCases.finalizeList(listId);
    await refreshLists();
  };

  const summaryLists = useMemo(
    () => ({
      active: lists.filter((list) => list.status !== 'finalized' && list.deletedAt === null),
      finalized: lists.filter((list) => list.status === 'finalized' && list.deletedAt === null),
    }),
    [lists]
  );

  const activeSummaryBudget = summaryLists.active.reduce((total, list) => total + list.budgetMinor, 0);
  const finalizedSummaryBudget = summaryLists.finalized.reduce((total, list) => total + list.budgetMinor, 0);

  if (runtime === null) {
    return (
      <AppHost>
        <AppColumn spacing={theme.space.lg} style={{ backgroundColor: theme.colors.surface, padding: theme.space.content }}>
          <AppText>{t('app.loading')}</AppText>
        </AppColumn>
      </AppHost>
    );
  }

  return (
    <AppHost>
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
          <SummaryCard
            accentColor={theme.colors.budgetSafe}
            body={t('home.activeSummaryBody')}
            budgetLabel={t('home.activeSummaryBudgetLabel')}
            budgetValue={formatCurrencyMinor(locale, activeSummaryBudget, resolvedCurrency)}
            listLabel={t('home.activeSummaryListsLabel')}
            listValue={String(summaryLists.active.length)}
            title={t('home.activeSummaryTitle')}
          />
          <SummaryCard
            accentColor={theme.colors.budgetNeutral}
            body={t('home.finalizedSummaryBody')}
            budgetLabel={t('home.finalizedSummaryBudgetLabel')}
            budgetValue={formatCurrencyMinor(locale, finalizedSummaryBudget, resolvedCurrency)}
            listLabel={t('home.finalizedSummaryListsLabel')}
            listValue={String(summaryLists.finalized.length)}
            title={t('home.finalizedSummaryTitle')}
          />
        </AppColumn>

        <AppButton
          accessibilityHint={t('home.openCreateListHint')}
          label={t('home.openCreateList')}
          onPress={() => onOpenNewList?.()}
          style={{ alignSelf: 'flex-start' }}
        />

        <AppColumn spacing={theme.space.md}>
          {lists.map((list) => (
            <PersistedListCard
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
              resolveCurrency={(currencyCode) => (currencyCode === 'USD' ? t('preferences.currencyUsd') : t('preferences.currencyBrl'))}
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
      </AppColumn>
    </AppHost>
  );
}

const styles = StyleSheet.create({
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  summaryCard: {
    borderLeftWidth: 4,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minWidth: 240,
    padding: 16,
  },
});
