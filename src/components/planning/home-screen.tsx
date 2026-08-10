import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { AppButton, AppColumn, AppHost, AppRow, AppSelect, AppSheet, AppText, AppTextField } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { PlannedItemEditorContent } from '@/components/planning/planned-item-editor';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingList } from '@/domain/shopping-list';
import { formatCurrencyMinor, parseCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';
import { type PlanningRuntime, usePlanningRuntime } from './planning-runtime';

import {
  buildCreateListDraft,
  canPersistCreateListDraft,
  createCreateListDraftStateFromList,
  createEmptyCreateListDraftState,
  resolveCreateListCurrency,
  type CreateListDraftState,
} from '@/app/home-state';

type HomeScreenProps = {
  dependencies?: PlanningRuntime;
  routeIntent?:
    | { kind: 'home' }
    | { kind: 'new-list' }
    | { kind: 'list-detail'; listId: string };
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

export default function HomeScreen({ dependencies, onOpenList, onOpenNewList, routeIntent = { kind: 'home' } }: HomeScreenProps = {}) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const currencyPreference = useLocalizationPreferencesStore((state) => state.currencyPreference);
  const languagePreference = useLocalizationPreferencesStore((state) => state.languagePreference);
  const runtime = usePlanningRuntime(dependencies);
  const [lists, setLists] = useState<readonly ShoppingList[]>([]);
  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const [draft, setDraft] = useState<CreateListDraftState | null>(null);
  const [plannedItemEditorVisible, setPlannedItemEditorVisible] = useState(false);
  const draftNameState = useNativeState('');
  const draftBudgetTextState = useNativeState('');

  const resolvedLocales = getLocales();
  const resolvedCurrency = useMemo(
    () => resolveCreateListCurrency({ currencyPreference, languagePreference }, resolvedLocales),
    [currencyPreference, languagePreference, resolvedLocales]
  );

  const currencyOptions = useMemo(
    () => [
      { label: t('preferences.currencyBrl'), value: 'BRL' as const },
      { label: t('preferences.currencyUsd'), value: 'USD' as const },
    ],
    [t]
  );

  const createSheetTitle = plannedItemEditorVisible ? t('plannedItem.title') : t('createList.title');

  const summaryLists = useMemo(
    () => ({
      active: lists.filter((list) => list.status !== 'finalized' && list.deletedAt === null),
      finalized: lists.filter((list) => list.status === 'finalized' && list.deletedAt === null),
    }),
    [lists]
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

  const openNewDraft = () => {
    if (onOpenNewList !== undefined) {
      onOpenNewList();
      return;
    }

    setDraft(createEmptyCreateListDraftState(resolvedCurrency));
    setCreateSheetVisible(true);
    setPlannedItemEditorVisible(false);
  };

  useEffect(() => {
    draftNameState.set(draft?.name ?? '');
  }, [draft?.name, draftNameState]);

  useEffect(() => {
    draftBudgetTextState.set(draft?.budgetText ?? '');
  }, [draft?.budgetText, draftBudgetTextState]);

  const loadListForEditing = async (list: ShoppingList) => {
    if (runtime === null) {
      return;
    }

    const loaded = await runtime.useCases.loadList(list.id, true);

    if (loaded === null) {
      return;
    }

    setDraft(createCreateListDraftStateFromList(loaded, locale, loaded.id));
    setCreateSheetVisible(true);
    setPlannedItemEditorVisible(false);
  };

  useEffect(() => {
    if (runtime === null || routeIntent.kind === 'home') {
      return;
    }

    if (routeIntent.kind === 'new-list') {
      void Promise.resolve().then(() => {
        setDraft(createEmptyCreateListDraftState(resolvedCurrency));
        setCreateSheetVisible(true);
        setPlannedItemEditorVisible(false);
      });
      return;
    }

    void runtime.useCases.loadList(routeIntent.listId, true).then((loaded) => {
      if (loaded === null) {
        return;
      }

      setDraft(createCreateListDraftStateFromList(loaded, locale, loaded.id));
      setCreateSheetVisible(true);
      setPlannedItemEditorVisible(false);
    });
  }, [locale, resolvedCurrency, routeIntent, runtime]);

  const saveCurrentDraft = async (finalize = false) => {
    if (runtime === null || draft === null) {
      return;
    }

    const persistedDraft = buildCreateListDraft(draft, new Date().toISOString(), locale);
    await runtime.useCases.saveList(persistedDraft);

    if (finalize) {
      await runtime.useCases.finalizeList(persistedDraft.id);
    }

    const reloaded = await runtime.useCases.loadList(persistedDraft.id, true);

    if (reloaded !== null) {
      setDraft(createCreateListDraftStateFromList(reloaded, locale, reloaded.id));
    }

    await refreshLists();
  };

  const finalizeList = async (listId: string) => {
    if (runtime === null) {
      return;
    }

    await runtime.useCases.finalizeList(listId);
    await refreshLists();
  };

  const reopenList = async (listId: string) => {
    if (runtime === null) {
      return;
    }

    const reopened = await runtime.useCases.reopenList(listId);
    setDraft(createCreateListDraftStateFromList(reopened, locale, reopened.id));
    setCreateSheetVisible(true);
    await refreshLists();
  };

  const canSaveDraft = draft === null ? false : canPersistCreateListDraft(draft, locale);
  const draftBudgetMinor = draft === null
    ? 0
    : (() => {
        try {
          return parseCurrencyMinor(locale, draft.budgetText, draft.currencyCode);
        } catch {
          return 0;
        }
      })();
  const selectedCurrencyLabel = draft?.currencyCode === 'USD' ? t('preferences.currencyUsd') : t('preferences.currencyBrl');
  const draftBudgetPreview = draft === null ? formatCurrencyMinor(locale, 0, resolvedCurrency) : formatCurrencyMinor(locale, draftBudgetMinor, draft.currencyCode);
  const draftItemCount = draft?.items.length ?? 0;

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

        <AppButton accessibilityHint={t('home.openCreateListHint')} label={t('home.openCreateList')} onPress={openNewDraft} style={{ alignSelf: 'flex-start' }} />

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
               onLoad={() => (onOpenList === undefined ? void loadListForEditing(list) : onOpenList(list.id))}
               onReopenAndEdit={(listId) => (onOpenList === undefined ? void reopenList(listId) : onOpenList(listId))}
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

        <AppSheet
          onClose={() => {
            setCreateSheetVisible(false);
            setPlannedItemEditorVisible(false);
          }}
          title={createSheetTitle}
          visible={createSheetVisible}
        >
          {plannedItemEditorVisible ? (
            <PlannedItemEditorContent
              currencyCode={draft?.currencyCode ?? resolvedCurrency}
              initialUnitCode="piece"
              onCancel={() => setPlannedItemEditorVisible(false)}
              onSave={(plannedItemDraft) => {
                const timestamp = new Date().toISOString();

                setDraft((current) => {
                  if (current === null) {
                    return null;
                  }

                  return {
                    ...current,
                    itemCount: current.items.length + 1,
                    items: [
                      ...current.items,
                      {
                        actualUnitMinor: null,
                        createdAt: timestamp,
                        deletedAt: null,
                        id: `${current.listId}-item-${current.items.length + 1}`,
                        listId: current.listId,
                        name: plannedItemDraft.name,
                        plannedUnitMinor: plannedItemDraft.plannedUnitMinor,
                        purchasedAt: null,
                        quantityMilli: plannedItemDraft.quantityMilli,
                        sortOrder: current.items.length + 1,
                        unitCode: plannedItemDraft.unitCode,
                        updatedAt: timestamp,
                      },
                    ],
                  };
                });
                setPlannedItemEditorVisible(false);
              }}
            />
          ) : (
            <AppColumn spacing={theme.space.md}>
              <AppColumn
                spacing={theme.space.xs}
                style={{
                  ...styles.previewCard,
                  backgroundColor: theme.colors.backgroundElement,
                  borderColor: theme.colors.border,
                }}
              >
                <AppText
                  textStyle={{
                    color: theme.colors.onSurface,
                    fontSize: theme.typography.label.fontSize,
                    fontWeight: theme.typography.label.fontWeight,
                    lineHeight: theme.typography.label.lineHeight,
                  }}
                >
                  {t('createList.summaryTitle')}
                </AppText>
                <AppRow spacing={theme.space.sm}>
                  <AppText
                    textStyle={{
                      color: theme.colors.muted,
                      fontSize: theme.typography.label.fontSize,
                      fontWeight: theme.typography.label.fontWeight,
                      lineHeight: theme.typography.label.lineHeight,
                    }}
                  >
                    {t('createList.summaryCurrencyLabel')}
                  </AppText>
                  <AppText
                    textStyle={{
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: theme.typography.body.fontWeight,
                      lineHeight: theme.typography.body.lineHeight,
                    }}
                  >
                    {selectedCurrencyLabel}
                  </AppText>
                </AppRow>
                <AppRow spacing={theme.space.sm}>
                  <AppText
                    textStyle={{
                      color: theme.colors.muted,
                      fontSize: theme.typography.label.fontSize,
                      fontWeight: theme.typography.label.fontWeight,
                      lineHeight: theme.typography.label.lineHeight,
                    }}
                  >
                    {t('createList.summaryBudgetLabel')}
                  </AppText>
                  <AppText
                    textStyle={{
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.numeric.fontSize,
                      fontWeight: theme.typography.numeric.fontWeight,
                      lineHeight: theme.typography.numeric.lineHeight,
                    }}
                  >
                    {draftBudgetPreview}
                  </AppText>
                </AppRow>
                <AppRow spacing={theme.space.sm}>
                  <AppText
                    textStyle={{
                      color: theme.colors.muted,
                      fontSize: theme.typography.label.fontSize,
                      fontWeight: theme.typography.label.fontWeight,
                      lineHeight: theme.typography.label.lineHeight,
                    }}
                  >
                    {t('createList.summaryItemsLabel')}
                  </AppText>
                  <AppText
                    textStyle={{
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: theme.typography.body.fontWeight,
                      lineHeight: theme.typography.body.lineHeight,
                    }}
                  >
                    {t('createList.itemCount', { count: draft?.items.length ?? 0 })}
                  </AppText>
                </AppRow>
              </AppColumn>

              {draftItemCount === 0 ? (
                <AppSelect
                  helperText={t('createList.currencyHint')}
                  label={t('createList.currencyLabel')}
                  onValueChange={(value) => {
                    setDraft((current) => (current === null ? null : { ...current, currencyCode: value as SupportedCurrency }));
                  }}
                  options={currencyOptions}
                  placeholder={t('preferences.currencySystem')}
                  testID="create-list-currency"
                  value={draft?.currencyCode ?? resolvedCurrency}
                />
              ) : (
                <AppColumn spacing={theme.space.xs}>
                  <AppText
                    textStyle={{
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.label.fontSize,
                      fontWeight: theme.typography.label.fontWeight,
                      lineHeight: theme.typography.label.lineHeight,
                    }}
                  >
                    {t('createList.currencyLabel')}
                  </AppText>
                  <AppText
                    textStyle={{
                      color: theme.colors.muted,
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: theme.typography.body.fontWeight,
                      lineHeight: theme.typography.body.lineHeight,
                    }}
                  >
                    {selectedCurrencyLabel}
                  </AppText>
                  <AppText
                    textStyle={{
                      color: theme.colors.muted,
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: theme.typography.body.fontWeight,
                      lineHeight: theme.typography.body.lineHeight,
                    }}
                  >
                    {t('createList.currencyLockedHint')}
                  </AppText>
                </AppColumn>
              )}

              <AppTextField
                accessibilityHint={t('createList.nameHint')}
                helperText={t('createList.nameHint')}
                label={t('createList.nameLabel')}
                onChangeText={(value) => {
                  draftNameState.set(value);
                  setDraft((current) => (current === null ? null : { ...current, name: value }));
                }}
                placeholder={t('createList.namePlaceholder')}
                testID="create-list-name"
                value={draftNameState}
              />

              <AppTextField
                accessibilityHint={t('createList.budgetHint')}
                helperText={t('createList.budgetHint')}
                keyboardType="decimal-pad"
                label={t('createList.budgetLabel')}
                onChangeText={(value) => {
                  draftBudgetTextState.set(value);
                  setDraft((current) => (current === null ? null : { ...current, budgetText: value }));
                }}
                placeholder={t('createList.budgetPlaceholder')}
                testID="create-list-budget"
                value={draftBudgetTextState}
              />

              <AppColumn spacing={theme.space.xs}>
                <AppText
                  textStyle={{
                    color: theme.colors.onSurface,
                    fontSize: theme.typography.label.fontSize,
                    fontWeight: theme.typography.label.fontWeight,
                    lineHeight: theme.typography.label.lineHeight,
                  }}
                >
                  {t('createList.itemsLabel')}
                </AppText>
                <AppText
                  textStyle={{
                    color: theme.colors.muted,
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: theme.typography.body.fontWeight,
                    lineHeight: theme.typography.body.lineHeight,
                  }}
                >
                  {t('createList.itemsHint')}
                </AppText>
                <AppRow spacing={theme.space.sm}>
                  <AppButton
                    accessibilityHint={t('createList.addItemHint')}
                    label={t('createList.addItem')}
                    onPress={() => setPlannedItemEditorVisible(true)}
                    testID="create-list-add-item"
                  />
                  {draftItemCount > 0 ? (
                    <AppButton
                      accessibilityHint={t('createList.clearItemsHint')}
                      label={t('createList.clearItems')}
                      onPress={() => {
                        setDraft((current) => (current === null ? null : { ...current, items: [], itemCount: 0 }));
                      }}
                      testID="create-list-clear-items"
                      variant="ghost"
                    />
                  ) : null}
                </AppRow>
              </AppColumn>

              <AppRow spacing={theme.space.sm}>
                <AppButton
                  accessibilityHint={t('createList.saveHint')}
                  disabled={!canSaveDraft}
                  label={t('createList.save')}
                  onPress={() => void saveCurrentDraft(false)}
                  testID="create-list-save"
                  variant="secondary"
                />
                <AppButton
                  accessibilityHint={t('createList.finalizeHint')}
                  disabled={!canSaveDraft}
                  label={t('createList.finalize')}
                  onPress={() => void saveCurrentDraft(true)}
                  testID="create-list-finalize"
                />
                <AppButton
                  accessibilityHint={t('createList.closeHint')}
                  label={t('createList.close')}
                  onPress={() => {
                    setCreateSheetVisible(false);
                    setPlannedItemEditorVisible(false);
                  }}
                  variant="ghost"
                />
              </AppRow>
            </AppColumn>
          )}
        </AppSheet>
      </AppColumn>
    </AppHost>
  );
}

export { buildCreateListDraft, canPersistCreateListDraft } from '@/app/home-state';
export type { CreateListDraftState } from '@/app/home-state';

const styles = StyleSheet.create({
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 16,
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
