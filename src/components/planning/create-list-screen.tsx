import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppColumn, AppHost, AppText } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
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
import { usePlanningRuntime, type PlanningRuntime } from './planning-runtime';

type CreateListScreenProps = {
  dependencies?: PlanningRuntime;
  onClose?: () => void;
};

export default function CreateListScreen({ dependencies, onClose = () => undefined }: CreateListScreenProps = {}) {
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

  const [draft, setDraft] = useState<CreateListDraftState>(() => createEmptyCreateListDraftState(resolvedCurrency));
  const [plannedItemEditorVisible, setPlannedItemEditorVisible] = useState(false);
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
        <ListFormSheet
          canSaveDraft={canSaveDraft}
          currencyOptions={currencyOptions}
          draft={draft}
          draftBudgetPreview={draftBudgetPreview}
          draftBudgetTextState={draftBudgetTextState}
          draftItemCount={draftItemCount}
          draftNameState={draftNameState}
          plannedItemEditorVisible={plannedItemEditorVisible}
          resolvedCurrencyLabel={selectedCurrencyLabel}
          title={t('createList.title')}
          visible
          onAddPlannedItem={() => setPlannedItemEditorVisible(true)}
          onBudgetTextChange={(value) => setDraft((current) => ({ ...current, budgetText: value }))}
          onClearItems={() => setDraft((current) => ({ ...current, items: [], itemCount: 0 }))}
          onClose={onClose}
          onClosePlannedItemEditor={() => setPlannedItemEditorVisible(false)}
          onCurrencyChange={(value) => setDraft((current) => ({ ...current, currencyCode: value }))}
          onFinalizeDraft={() => void saveCurrentDraft(true)}
          onNameChange={(value) => setDraft((current) => ({ ...current, name: value }))}
          onSaveDraft={() => void saveCurrentDraft(false)}
          onSavePlannedItem={(plannedItemDraft) => {
            const timestamp = new Date().toISOString();

            setDraft((current) => ({
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
            }));
            setPlannedItemEditorVisible(false);
          }}
        />
      </AppColumn>
    </AppHost>
  );
}
