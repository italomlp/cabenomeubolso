import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppRow, AppScreen, AppText, AppUndoNotice } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import { formatCurrencyMinor, formatQuantityMilli, parseCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';

import { buildCreateListDraft, canPersistCreateListDraft, createCreateListDraftStateFromList, resolveCreateListCurrency, type CreateListDraftState } from '@/app/home-state';
import type { ShoppingListItem } from '@/domain/shopping-list';

import { GroceryItemRow } from './grocery-item-row';
import { ListFormSheet } from './list-form-sheet';
import type { PlannedItemDraft } from './planned-item-editor';
import { usePlanningRuntime, type PlanningRuntime } from './planning-runtime';

type ListDetailScreenProps = {
  dependencies?: PlanningRuntime;
  listId: string;
  onClose?: () => void;
};

function toPlannedItemDraft(item: ShoppingListItem): PlannedItemDraft {
  return {
    name: item.name,
    plannedUnitMinor: item.plannedUnitMinor,
    quantityMilli: item.quantityMilli,
    unitCode: item.unitCode,
  };
}

export default function ListDetailScreen({ dependencies, listId, onClose = () => undefined }: ListDetailScreenProps) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const currencyPreference = useLocalizationPreferencesStore((state) => state.currencyPreference);
  const languagePreference = useLocalizationPreferencesStore((state) => state.languagePreference);
  const runtime = usePlanningRuntime(dependencies);
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

  const [draft, setDraft] = useState<CreateListDraftState | null>(null);
  const [plannedItemEditorVisible, setPlannedItemEditorVisible] = useState(false);
  const [plannedItemEditorInitialItem, setPlannedItemEditorInitialItem] = useState<PlannedItemDraft | undefined>(undefined);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [recentlyRemovedItem, setRecentlyRemovedItem] = useState<ShoppingListItem | null>(null);
  const draftNameState = useNativeState('');
  const draftBudgetTextState = useNativeState('');

  useEffect(() => {
    if (runtime === null) {
      return;
    }

    let isActive = true;

    void runtime.useCases.loadList(listId, true).then((loaded) => {
      if (!isActive || loaded === null) {
        return;
      }

      setDraft(createCreateListDraftStateFromList(loaded, locale, loaded.id));
      setRecentlyRemovedItem(null);
      setEditingItemId(null);
      setPlannedItemEditorInitialItem(undefined);
    });

    return () => {
      isActive = false;
    };
  }, [listId, locale, runtime]);

  useEffect(() => {
    draftNameState.set(draft?.name ?? '');
  }, [draft?.name, draftNameState]);

  useEffect(() => {
    draftBudgetTextState.set(draft?.budgetText ?? '');
  }, [draft?.budgetText, draftBudgetTextState]);

  const refreshDraft = async (nextListId = listId) => {
    if (runtime === null) {
      return;
    }

    const reloaded = await runtime.useCases.loadList(nextListId, true);

    if (reloaded !== null) {
      setDraft(createCreateListDraftStateFromList(reloaded, locale, reloaded.id));
    }
  };

  const saveCurrentDraft = async (finalize = false) => {
    if (runtime === null || draft === null) {
      return;
    }

    const persistedDraft = buildCreateListDraft(draft, new Date().toISOString(), locale);
    await runtime.useCases.saveList(persistedDraft);

    if (finalize) {
      await runtime.useCases.finalizeList(persistedDraft.id);
    }

    await refreshDraft(persistedDraft.id);
  };

  const reopenList = async () => {
    if (runtime === null || draft === null) {
      return;
    }

    await runtime.useCases.reopenList(draft.listId);
    await refreshDraft(draft.listId);
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
  const draftBudgetPreview = draft === null ? formatCurrencyMinor(locale, 0, resolvedCurrency) : formatCurrencyMinor(locale, draftBudgetMinor, draft.currencyCode);
  const visibleItems = useMemo(
    () => (draft === null ? [] : draft.items.filter((item) => item.deletedAt === null)),
    [draft]
  );
  const visibleItemCount = visibleItems.length;
  const isReadOnly = draft?.status === 'finalized';
  const selectedCurrencyLabel = draft?.currencyCode === 'USD' ? t('preferences.currencyUsd') : t('preferences.currencyBrl');

  if (runtime === null || draft === null) {
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
        <ListFormSheet
          canSaveDraft={canSaveDraft}
          currencyOptions={currencyOptions}
          draft={draft}
          draftBudgetPreview={draftBudgetPreview}
          draftBudgetTextState={draftBudgetTextState}
          draftItemCount={visibleItemCount}
          draftNameState={draftNameState}
          plannedItemEditorVisible={plannedItemEditorVisible}
          plannedItemInitialItem={plannedItemEditorInitialItem}
          resolvedCurrencyLabel={selectedCurrencyLabel}
          title={t('listDetail.title')}
          visible
          onAddPlannedItem={() => {
            setEditingItemId(null);
            setPlannedItemEditorInitialItem(undefined);
            setPlannedItemEditorVisible(true);
          }}
          onBudgetTextChange={(value) => setDraft((current) => (current === null ? null : { ...current, budgetText: value }))}
          onClearItems={() => setDraft((current) => (current === null ? null : { ...current, items: [], itemCount: 0 }))}
          onClose={onClose}
          onClosePlannedItemEditor={() => {
            setPlannedItemEditorVisible(false);
            setEditingItemId(null);
            setPlannedItemEditorInitialItem(undefined);
          }}
          onCurrencyChange={(value) => setDraft((current) => (current === null ? null : { ...current, currencyCode: value }))}
          onFinalizeDraft={() => void saveCurrentDraft(true)}
          onNameChange={(value) => setDraft((current) => (current === null ? null : { ...current, name: value }))}
          onReopenList={draft.status === 'finalized' ? () => void reopenList() : undefined}
          onSaveDraft={() => void saveCurrentDraft(false)}
          onSavePlannedItem={(plannedItemDraft) => {
            const timestamp = new Date().toISOString();

            setDraft((current) => {
              if (current === null) {
                return null;
              }

              if (editingItemId !== null) {
                return {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === editingItemId
                      ? {
                          ...item,
                          name: plannedItemDraft.name,
                          plannedUnitMinor: plannedItemDraft.plannedUnitMinor,
                          quantityMilli: plannedItemDraft.quantityMilli,
                          unitCode: plannedItemDraft.unitCode,
                          updatedAt: timestamp,
                        }
                      : item
                  ),
                };
              }

              return {
                ...current,
                itemCount: current.items.filter((item) => item.deletedAt === null).length + 1,
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
            setEditingItemId(null);
            setPlannedItemEditorInitialItem(undefined);
            setPlannedItemEditorVisible(false);
          }}
          showClearItems={false}
        >
          <AppColumn spacing={theme.space.sm}>
            {visibleItems.map((item) => {
              const unitLabel = t(`units.${item.unitCode}`);
              const quantityLabel = `${formatQuantityMilli(locale, item.unitCode, item.quantityMilli)} ${unitLabel}`;
              const plannedValue = formatCurrencyMinor(locale, item.plannedUnitMinor, draft.currencyCode);
              const actualValue = item.actualUnitMinor === null ? null : formatCurrencyMinor(locale, item.actualUnitMinor, draft.currencyCode);

              return (
                <AppColumn key={item.id} spacing={theme.space.xs}>
                  <GroceryItemRow
                    actualLabel={actualValue === null ? undefined : t('listDetail.actualPriceLabel', { unit: unitLabel })}
                    actualValue={actualValue ?? undefined}
                    plannedLabel={t('plannedItem.priceLabel', { unit: unitLabel })}
                    plannedValue={plannedValue}
                    quantityLabel={quantityLabel}
                    title={item.name}
                  />
                  {!isReadOnly ? (
                    <AppRow spacing={theme.space.sm}>
                      <AppButton
                        accessibilityHint={t('plannedItem.edit')}
                        label={t('plannedItem.edit')}
                        onPress={() => {
                          setEditingItemId(item.id);
                          setPlannedItemEditorInitialItem(toPlannedItemDraft(item));
                          setPlannedItemEditorVisible(true);
                        }}
                        testID={`edit-item-${item.id}`}
                        variant="secondary"
                      />
                      <AppButton
                        accessibilityHint={t('listDetail.removeItemHint')}
                        disabled={visibleItemCount <= 1}
                        label={t('plannedItem.remove')}
                        onPress={async () => {
                          if (runtime === null || draft === null || visibleItemCount <= 1) {
                            return;
                          }

                          const nextList = await runtime.useCases.removeItem(draft.listId, item.id);
                          setDraft(createCreateListDraftStateFromList(nextList, locale, nextList.id));
                          setRecentlyRemovedItem(item);
                          setEditingItemId(null);
                          setPlannedItemEditorInitialItem(undefined);
                        }}
                        testID={`remove-item-${item.id}`}
                        variant="destructive"
                      />
                    </AppRow>
                  ) : null}
                </AppColumn>
              );
            })}

            <AppUndoNotice
              message={recentlyRemovedItem === null ? '' : t('listDetail.removedItemMessage', { name: recentlyRemovedItem.name })}
              onUndo={async () => {
                if (runtime === null || recentlyRemovedItem === null || draft === null) {
                  return;
                }

                const restoredList = await runtime.useCases.restoreItem(draft.listId, recentlyRemovedItem.id);
                setDraft(createCreateListDraftStateFromList(restoredList, locale, restoredList.id));
                setRecentlyRemovedItem(null);
              }}
              visible={recentlyRemovedItem !== null}
            />
          </AppColumn>
        </ListFormSheet>

      </AppColumn>
    </AppScreen>
  );
}
