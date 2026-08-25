import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { announceForAccessibility, AppButton, AppColumn, AppRow, AppScreen, AppText, AppUndoNotice } from '@/components/ui';
import { BudgetSummary } from './budget-summary';
import { useNativeState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import { formatCurrencyMinor, formatQuantityMilli, parseCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';

import { buildCreateListDraft, canPersistCreateListDraft, createCreateListDraftStateFromList, resolveCreateListCurrency, type CreateListDraftState } from '@/app/home-state';
import type { ShoppingListItem } from '@/domain/shopping-list';
import { calculateShoppingListTotals } from '@/domain/shopping-list';

import { GroceryItemRow } from './grocery-item-row';
import { ListFormSheet } from './list-form-sheet';
import { FinalizeConfirmation } from './finalize-confirmation';
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
  const [errorKind, setErrorKind] = useState<'finalize' | 'load' | 'save' | null>(null);
  const [finalizeConfirmationVisible, setFinalizeConfirmationVisible] = useState(false);
  const draftNameState = useNativeState('');
  const draftBudgetTextState = useNativeState('');

  useEffect(() => {
    if (runtime === null) {
      return;
    }

    let isActive = true;

    void runtime.useCases.loadList(listId, true).then((loaded) => {
      if (!isActive) {
        return;
      }

      if (loaded === null) {
        setErrorKind('load');
        return;
      }

      setDraft(createCreateListDraftStateFromList(loaded, locale, loaded.id));
      setErrorKind(null);
      setRecentlyRemovedItem(null);
      setEditingItemId(null);
      setPlannedItemEditorInitialItem(undefined);
    }).catch(() => {
      if (isActive) {
        setErrorKind('load');
      }
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

    try {
      const reloaded = await runtime.useCases.loadList(nextListId, true);

      if (reloaded === null) {
        throw new Error('List not found');
      }

      setDraft(createCreateListDraftStateFromList(reloaded, locale, reloaded.id));
      setErrorKind(null);
    } catch (error) {
      setErrorKind('load');
      throw error;
    }
  };

  const saveCurrentDraft = async (finalize = false) => {
    if (runtime === null || draft === null) {
      return;
    }

    try {
      const persistedDraft = buildCreateListDraft(draft, new Date().toISOString(), locale);
      await runtime.useCases.saveList(persistedDraft);
    } catch {
      setErrorKind('save');
      return;
    }

    if (finalize) {
      try {
        await runtime.useCases.finalizeList(draft.listId, { confirmUnpurchased: true });
      } catch {
        setErrorKind('finalize');
        return;
      }
    }

    await refreshDraft(draft.listId).catch(() => undefined);
  };

  const retry = () => {
    if (errorKind === 'load') {
      void refreshDraft().catch(() => undefined);
    } else if (errorKind === 'save') {
      void saveCurrentDraft(false);
    } else if (errorKind === 'finalize') {
      void saveCurrentDraft(true);
    }
  };

  const reopenList = async () => {
    if (runtime === null || draft === null) {
      return;
    }

    try {
      await runtime.useCases.reopenList(draft.listId);
      announceForAccessibility(t('listDetail.reopenedAnnouncement'));
      setRecentlyRemovedItem(null);
      setEditingItemId(null);
      setPlannedItemEditorInitialItem(undefined);
      setPlannedItemEditorVisible(false);
      await refreshDraft(draft.listId);
    } catch {
      setErrorKind('save');
    }
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
  const hasUnpurchasedItems = visibleItems.some((item) => item.purchasedAt === null);
  const requestFinalize = () => {
    if (hasUnpurchasedItems) {
      setFinalizeConfirmationVisible(true);
      return;
    }

    void saveCurrentDraft(true);
  };

  const budgetStatusAnnouncement = (nextDraft: CreateListDraftState) => {
    const budgetMinor = (() => {
      try {
        return parseCurrencyMinor(locale, nextDraft.budgetText, nextDraft.currencyCode);
      } catch {
        return 0;
      }
    })();
    const nextVisibleItems = nextDraft.items.filter((item) => item.deletedAt === null);
    const totals = calculateShoppingListTotals({
      ...nextDraft,
      budgetMinor,
      createdAt: '',
      deletedAt: null,
      finalizedAt: null,
      id: nextDraft.listId,
      items: nextVisibleItems,
      name: nextDraft.name,
      status: nextDraft.status ?? 'draft',
      updatedAt: '',
    });

    return t('listDetail.budgetStatusAnnouncement', {
      budget: formatCurrencyMinor(locale, budgetMinor, nextDraft.currencyCode),
      planned: formatCurrencyMinor(locale, totals.plannedMinor, nextDraft.currencyCode),
      status: totals.remainingMinor >= 0 ? t('listDetail.withinBudget') : t('listDetail.overBudget'),
    });
  };

  if (runtime === null || draft === null) {
    return (
      <AppScreen>
        {errorKind === 'load' ? (
          <AppColumn spacing={theme.space.sm} style={{ padding: theme.space.content }}>
            <AppText>{t('listDetail.loadError')}</AppText>
            <AppButton label={t('listDetail.retry')} onPress={retry} testID="list-detail-retry" variant="secondary" />
          </AppColumn>
        ) : <AppText>{t('app.loading')}</AppText>}
      </AppScreen>
    );
  }

  return (
    <AppScreen>
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
        onFinalizeDraft={requestFinalize}
        onNameChange={(value) => setDraft((current) => (current === null ? null : { ...current, name: value }))}
        onReopenList={draft.status === 'finalized' ? () => void reopenList() : undefined}
        onSaveDraft={() => void saveCurrentDraft(false)}
        onSavePlannedItem={(plannedItemDraft) => {
          const timestamp = new Date().toISOString();

          if (draft !== null) {
            const nextDraft: CreateListDraftState = editingItemId === null
              ? {
                  ...draft,
                  itemCount: draft.items.filter((item) => item.deletedAt === null).length + 1,
                  items: [
                    ...draft.items,
                    {
                      actualUnitMinor: null,
                      createdAt: timestamp,
                      deletedAt: null,
                      id: `${draft.listId}-item-${draft.items.length + 1}`,
                      listId: draft.listId,
                      name: plannedItemDraft.name,
                      plannedUnitMinor: plannedItemDraft.plannedUnitMinor,
                      purchasedAt: null,
                      quantityMilli: plannedItemDraft.quantityMilli,
                      sortOrder: draft.items.length + 1,
                      unitCode: plannedItemDraft.unitCode,
                      updatedAt: timestamp,
                    },
                  ],
                }
              : {
                  ...draft,
                  items: draft.items.map((item) =>
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

            setDraft(nextDraft);
            announceForAccessibility(`${t(editingItemId === null ? 'listDetail.itemAddedAnnouncement' : 'listDetail.itemUpdatedAnnouncement', { name: plannedItemDraft.name })} ${budgetStatusAnnouncement(nextDraft)}`);
          }
          setEditingItemId(null);
          setPlannedItemEditorInitialItem(undefined);
          setPlannedItemEditorVisible(false);
        }}
        showClearItems={false}
        showItemActions={false}
        showDraftSummary={false}
        showItemPreview={false}
      >
        <AppColumn spacing={theme.space.sm}>
          {errorKind !== null ? (
            <AppColumn spacing={theme.space.sm}>
              <AppText>{t(errorKind === 'load' ? 'listDetail.loadError' : errorKind === 'save' ? 'listDetail.saveError' : 'listDetail.finalizeError')}</AppText>
              <AppButton label={t('listDetail.retry')} onPress={retry} testID="list-detail-retry" variant="secondary" />
            </AppColumn>
          ) : null}
          {(() => {
            const totals = calculateShoppingListTotals({
              ...draft,
              budgetMinor: draftBudgetMinor,
              createdAt: '',
              deletedAt: null,
              finalizedAt: null,
              id: draft.listId,
              items: visibleItems,
              name: draft.name,
              status: draft.status ?? 'draft',
              updatedAt: '',
            });

            return (
              <BudgetSummary
                accentColor={totals.remainingMinor >= 0 ? theme.colors.budgetSafe : theme.colors.budgetRisk}
                body={t('createList.itemsHint')}
                budgetLabel={t('createList.summaryBudgetLabel')}
                budgetValue={formatCurrencyMinor(locale, draftBudgetMinor, draft.currencyCode)}
                listLabel={t('createList.itemsLabel')}
                listValue={String(visibleItemCount)}
                statusIcon={totals.remainingMinor >= 0 ? '✓' : '!'}
                statusLabel={totals.remainingMinor >= 0 ? t('listDetail.withinBudget') : t('listDetail.overBudget')}
                title={t('createList.summaryTitle')}
              />
            );
          })()}
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

                        try {
                          const nextList = await runtime.useCases.removeItem(draft.listId, item.id);
                          const nextDraft = createCreateListDraftStateFromList(nextList, locale, nextList.id);
                          setDraft(nextDraft);
                          announceForAccessibility(`${t('listDetail.itemRemovedAnnouncement', { name: item.name })} ${budgetStatusAnnouncement(nextDraft)}`);
                          setRecentlyRemovedItem(item);
                          setEditingItemId(null);
                          setPlannedItemEditorInitialItem(undefined);
                        } catch {
                          setErrorKind('save');
                        }
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

              try {
                const restoredList = await runtime.useCases.restoreItem(draft.listId, recentlyRemovedItem.id);
                const restoredDraft = createCreateListDraftStateFromList(restoredList, locale, restoredList.id);
                setDraft(restoredDraft);
                announceForAccessibility(`${t('listDetail.itemRestoredAnnouncement', { name: recentlyRemovedItem.name })} ${budgetStatusAnnouncement(restoredDraft)}`);
                setRecentlyRemovedItem(null);
              } catch {
                setErrorKind('save');
              }
            }}
            visible={recentlyRemovedItem !== null}
          />
        </AppColumn>
      </ListFormSheet>
      <FinalizeConfirmation
        cancelHint={t('listDetail.finalizeCancelHint')}
        cancelLabel={t('listDetail.finalizeCancel')}
        confirmHint={t('listDetail.finalizeConfirmHint')}
        confirmLabel={t('listDetail.finalizeConfirm')}
        message={t('listDetail.finalizeUnpurchasedMessage')}
        title={t('listDetail.finalizeConfirmationTitle')}
        visible={finalizeConfirmationVisible}
        onCancel={() => setFinalizeConfirmationVisible(false)}
        onConfirm={() => {
          setFinalizeConfirmationVisible(false);
          void saveCurrentDraft(true);
        }}
      />
    </AppScreen>
  );
}
