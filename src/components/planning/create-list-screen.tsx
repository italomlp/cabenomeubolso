import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppScreen, AppText } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { formatCurrencyMinor, parseCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { useLocalizationPreferencesStore } from '@/stores/localization-preferences';

import {
  buildCreateListDraft,
  canPersistCreateListDraft,
  createCreateListDraftStateFromList,
  createEmptyCreateListDraftState,
  resolveCreateListCurrency,
  type CreateListDraftState,
} from '@/app/home-state';

import { ListFormSheet } from './list-form-sheet';
import type { PlannedItemDraft } from './planned-item-editor';
import { usePlanningRuntime, type PlanningRuntime } from './planning-runtime';

type CreateListScreenProps = {
  dependencies?: PlanningRuntime;
  onClose?: () => void;
};

export default function CreateListScreen({ dependencies, onClose = () => undefined }: CreateListScreenProps = {}) {
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

  const [draft, setDraft] = useState<CreateListDraftState>(() => createEmptyCreateListDraftState(resolvedCurrency));
  const [plannedItemEditorVisible, setPlannedItemEditorVisible] = useState(false);
  const [plannedItemEditorInitialItem, setPlannedItemEditorInitialItem] = useState<PlannedItemDraft | undefined>();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const draftNameState = useNativeState('');
  const draftBudgetTextState = useNativeState('');

  useEffect(() => {
    draftNameState.set(draft.name);
  }, [draft.name, draftNameState]);

  useEffect(() => {
    draftBudgetTextState.set(draft.budgetText);
  }, [draft.budgetText, draftBudgetTextState]);

  const saveCurrentDraft = async (finalize = false) => {
    if (runtime === null) {
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
  };

  const canSaveDraft = canPersistCreateListDraft(draft, locale);
  const draftBudgetMinor = (() => {
    try {
      return parseCurrencyMinor(locale, draft.budgetText, draft.currencyCode);
    } catch {
      return 0;
    }
  })();
  const draftBudgetPreview = formatCurrencyMinor(locale, draftBudgetMinor, draft.currencyCode);
  const draftItemCount = draft.items.length;
  const selectedCurrencyLabel = draft.currencyCode === 'USD' ? t('preferences.currencyUsd') : t('preferences.currencyBrl');

  if (runtime === null) {
    return (
      <AppScreen>
        <AppText>{t('app.loading')}</AppText>
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
        draftItemCount={draftItemCount}
        draftNameState={draftNameState}
        plannedItemInitialItem={plannedItemEditorInitialItem}
        plannedItemEditorVisible={plannedItemEditorVisible}
        resolvedCurrencyLabel={selectedCurrencyLabel}
        title={t('createList.title')}
        visible
        onAddPlannedItem={() => {
          setEditingItemId(null);
          setPlannedItemEditorInitialItem(undefined);
          setPlannedItemEditorVisible(true);
        }}
        onBudgetTextChange={(value) => setDraft((current) => ({ ...current, budgetText: value }))}
        onClearItems={() => setDraft((current) => ({ ...current, items: [], itemCount: 0 }))}
        onClose={onClose}
        onClosePlannedItemEditor={() => {
          setEditingItemId(null);
          setPlannedItemEditorInitialItem(undefined);
          setPlannedItemEditorVisible(false);
        }}
        onCurrencyChange={(value) => setDraft((current) => ({ ...current, currencyCode: value }))}
        onFinalizeDraft={() => void saveCurrentDraft(true)}
        onNameChange={(value) => setDraft((current) => ({ ...current, name: value }))}
        onEditPlannedItem={(item) => {
          setEditingItemId(item.id);
          setPlannedItemEditorInitialItem({ name: item.name, plannedUnitMinor: item.plannedUnitMinor, quantityMilli: item.quantityMilli, unitCode: item.unitCode });
          setPlannedItemEditorVisible(true);
        }}
        onRemovePlannedItem={(itemId) => setDraft((current) => ({ ...current, itemCount: Math.max(0, current.itemCount - 1), items: current.items.filter((item) => item.id !== itemId) }))}
        onSaveDraft={() => void saveCurrentDraft(false)}
        onSavePlannedItem={(plannedItemDraft) => {
          const timestamp = new Date().toISOString();

          setDraft((current) => {
            if (editingItemId !== null) {
              return { ...current, items: current.items.map((item) => item.id === editingItemId ? { ...item, ...plannedItemDraft, updatedAt: timestamp } : item) };
            }

            return ({
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
            });
          });
          setEditingItemId(null);
          setPlannedItemEditorInitialItem(undefined);
          setPlannedItemEditorVisible(false);
        }}
      />
    </AppScreen>
  );
}
