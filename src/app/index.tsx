import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { AppButton, AppColumn, AppHost, AppRow, AppSelect, AppSheet, AppText, AppTextField } from '@/components/ui';
import { PlannedItemEditorSheet } from '@/components/planning/planned-item-editor';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import {
  validateShoppingListForSave,
  type ShoppingList,
  type ShoppingListItem,
} from '@/domain/shopping-list';
import { formatCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';

export type CreateListDraftState = {
  budgetText: string;
  currencyCode: SupportedCurrency;
  itemCount: number;
  name: string;
};

const DRAFT_LIST_ID = 'create-list-shell-draft';

function parseBudgetMinor(value: string): number {
  if (value.trim().length === 0) {
    return Number.NaN;
  }

  const parsedValue = Number(value);

  return Number.isSafeInteger(parsedValue) && parsedValue >= 0 ? parsedValue : Number.NaN;
}

function buildCreateListDraftItem(index: number, timestamp: string): ShoppingListItem {
  return {
    actualUnitMinor: null,
    createdAt: timestamp,
    deletedAt: null,
    id: `${DRAFT_LIST_ID}-item-${index + 1}`,
    listId: DRAFT_LIST_ID,
    name: `placeholder-${index + 1}`,
    plannedUnitMinor: 0,
    purchasedAt: null,
    quantityMilli: 1000,
    sortOrder: index + 1,
    unitCode: 'piece',
    updatedAt: timestamp,
  };
}

export function buildCreateListDraft(state: CreateListDraftState, timestamp = new Date().toISOString()): ShoppingList {
  return {
    budgetMinor: parseBudgetMinor(state.budgetText),
    createdAt: timestamp,
    currencyCode: state.currencyCode,
    deletedAt: null,
    finalizedAt: null,
    id: DRAFT_LIST_ID,
    items: Array.from({ length: state.itemCount }, (_, index) => buildCreateListDraftItem(index, timestamp)),
    name: state.name,
    status: 'draft',
    updatedAt: timestamp,
  };
}

export function canPersistCreateListDraft(state: CreateListDraftState): boolean {
  return validateShoppingListForSave(buildCreateListDraft(state)).success;
}

function formatMoney(locale: string, amountMinor: number, currencyCode: SupportedCurrency): string {
  return formatCurrencyMinor(locale, amountMinor, currencyCode);
}

type SummaryCardProps = {
  accentColor: string;
  budgetLabel: string;
  budgetValue: string;
  body: string;
  listLabel: string;
  listValue: string;
  title: string;
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

export default function HomeScreen() {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const [draftBudgetText, setDraftBudgetText] = useState('');
  const [draftName, setDraftName] = useState('');
  const [currency, setCurrency] = useState<SupportedCurrency>('BRL');
  const [plannedItemEditorVisible, setPlannedItemEditorVisible] = useState(false);
  const [plannedItems, setPlannedItems] = useState<ShoppingListItem[]>([]);

  const currencyOptions = useMemo(
    () => [
      { label: t('preferences.currencyBrl'), value: 'BRL' as const },
      { label: t('preferences.currencyUsd'), value: 'USD' as const },
    ],
    [t]
  );

  const draftState: CreateListDraftState = {
    budgetText: draftBudgetText,
    currencyCode: currency,
    itemCount: plannedItems.length,
    name: draftName,
  };
  const draftBudgetMinor = parseBudgetMinor(draftBudgetText);
  const canPersistDraft = validateShoppingListForSave(buildCreateListDraft(draftState)).success;
  const selectedCurrencyLabel = currency === 'BRL' ? t('preferences.currencyBrl') : t('preferences.currencyUsd');
  const draftBudgetPreview = formatMoney(locale, Number.isSafeInteger(draftBudgetMinor) ? draftBudgetMinor : 0, currency);
  const closeCreateSheet = () => {
    setCreateSheetVisible(false);
    setPlannedItemEditorVisible(false);
  };

  const activeSummary = {
    body: t('home.activeSummaryBody'),
    budget: formatMoney(locale, 128_400, 'BRL'),
    count: '2',
    countLabel: t('home.activeSummaryListsLabel'),
    title: t('home.activeSummaryTitle'),
  };

  const finalizedSummary = {
    body: t('home.finalizedSummaryBody'),
    budget: formatMoney(locale, 429_500, 'USD'),
    count: '4',
    countLabel: t('home.finalizedSummaryListsLabel'),
    title: t('home.finalizedSummaryTitle'),
  };

  return (
    <AppHost>
      <AppColumn
        spacing={theme.space.lg}
        style={{ backgroundColor: theme.colors.surface, padding: theme.space.content }}
      >
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
            body={activeSummary.body}
            budgetLabel={t('home.activeSummaryBudgetLabel')}
            budgetValue={activeSummary.budget}
            listLabel={activeSummary.countLabel}
            listValue={activeSummary.count}
            title={activeSummary.title}
          />
          <SummaryCard
            accentColor={theme.colors.budgetNeutral}
            body={finalizedSummary.body}
            budgetLabel={t('home.finalizedSummaryBudgetLabel')}
            budgetValue={finalizedSummary.budget}
            listLabel={finalizedSummary.countLabel}
            listValue={finalizedSummary.count}
            title={finalizedSummary.title}
          />
        </AppColumn>

        <AppButton accessibilityHint={t('home.openCreateListHint')} label={t('home.openCreateList')} onPress={() => setCreateSheetVisible(true)} style={{ alignSelf: 'flex-start' }} />

        <AppSheet onClose={closeCreateSheet} title={t('createList.title')} visible={createSheetVisible}>
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
                  {t('createList.itemCount', { count: plannedItems.length })}
                </AppText>
              </AppRow>
            </AppColumn>

            {plannedItems.length === 0 ? (
              <AppSelect
                helperText={t('createList.currencyHint')}
                label={t('createList.currencyLabel')}
                onValueChange={(value) => setCurrency(value as SupportedCurrency)}
                options={currencyOptions}
                placeholder={t('preferences.currencySystem')}
                testID="create-list-currency"
                value={currency}
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
                onChangeText={setDraftName}
                placeholder={t('createList.namePlaceholder')}
                testID="create-list-name"
              />

              <AppTextField
                accessibilityHint={t('createList.budgetHint')}
                helperText={t('createList.budgetHint')}
                keyboardType="number-pad"
                label={t('createList.budgetLabel')}
                onChangeText={setDraftBudgetText}
                placeholder={t('createList.budgetPlaceholder')}
                testID="create-list-budget"
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
              {plannedItems.length > 0 ? (
                <AppButton
                  accessibilityHint={t('createList.clearItemsHint')}
                  label={t('createList.clearItems')}
                  onPress={() => setPlannedItems([])}
                  testID="create-list-clear-items"
                  variant="ghost"
                />
                ) : null}
              </AppRow>
            </AppColumn>

            <AppRow spacing={theme.space.sm}>
              <AppButton
                accessibilityHint={t('createList.saveHint')}
                disabled={!canPersistDraft}
                label={t('createList.save')}
                onPress={closeCreateSheet}
                testID="create-list-save"
                variant="secondary"
              />
              <AppButton
                accessibilityHint={t('createList.finalizeHint')}
                disabled={!canPersistDraft}
                label={t('createList.finalize')}
                onPress={closeCreateSheet}
                testID="create-list-finalize"
              />
              <AppButton
                accessibilityHint={t('createList.closeHint')}
                label={t('createList.close')}
                onPress={closeCreateSheet}
                variant="ghost"
              />
            </AppRow>
          </AppColumn>
        </AppSheet>

        <PlannedItemEditorSheet
          currencyCode={currency}
          onCancel={() => setPlannedItemEditorVisible(false)}
          onSave={(draft) => {
            const timestamp = new Date().toISOString();

            setPlannedItems((currentItems) => [
              ...currentItems,
              {
                actualUnitMinor: null,
                createdAt: timestamp,
                deletedAt: null,
                id: `draft-item-${currentItems.length + 1}`,
                listId: DRAFT_LIST_ID,
                name: draft.name,
                plannedUnitMinor: draft.plannedUnitMinor,
                purchasedAt: null,
                quantityMilli: draft.quantityMilli,
                sortOrder: currentItems.length + 1,
                unitCode: draft.unitCode,
                updatedAt: timestamp,
              },
            ]);
            setPlannedItemEditorVisible(false);
          }}
          visible={plannedItemEditorVisible}
        />
      </AppColumn>
    </AppHost>
  );
}

const styles = StyleSheet.create({
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
