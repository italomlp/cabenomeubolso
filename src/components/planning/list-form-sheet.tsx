import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppRow, AppSelect, AppSheet, AppText, AppTextField } from '@/components/ui';
import type { ObservableState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import { i18n } from '@/lib/localization/i18n';

import { PlannedItemEditorContent, type PlannedItemDraft } from './planned-item-editor';
import type { CreateListDraftState } from '@/app/home-state';

type ListCurrencyOption = {
  label: string;
  value: SupportedCurrency;
};

type ListFormSheetProps = {
  canSaveDraft: boolean;
  currencyOptions: readonly ListCurrencyOption[];
  draft: CreateListDraftState | null;
  draftBudgetPreview: string;
  draftBudgetTextState: ObservableState<string>;
  draftItemCount: number;
  draftNameState: ObservableState<string>;
  plannedItemEditorVisible: boolean;
  resolvedCurrencyLabel: string;
  title: string;
  visible: boolean;
  onAddPlannedItem: () => void;
  onBudgetTextChange: (value: string) => void;
  onClearItems: () => void;
  onClose: () => void;
  onCurrencyChange: (value: SupportedCurrency) => void;
  onFinalizeDraft: () => void;
  onClosePlannedItemEditor: () => void;
  onNameChange: (value: string) => void;
  onSaveDraft: () => void;
  onSavePlannedItem: (draft: PlannedItemDraft) => void;
};

export function ListFormSheet({
  canSaveDraft,
  currencyOptions,
  draft,
  draftBudgetPreview,
  draftBudgetTextState,
  draftItemCount,
  draftNameState,
  plannedItemEditorVisible,
  resolvedCurrencyLabel,
  title,
  visible,
  onAddPlannedItem,
  onBudgetTextChange,
  onClearItems,
  onClose,
  onCurrencyChange,
  onFinalizeDraft,
  onClosePlannedItemEditor,
  onNameChange,
  onSaveDraft,
  onSavePlannedItem,
}: ListFormSheetProps) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });

  const canShowCurrencySelect = draftItemCount === 0;

  if (!visible || draft === null) {
    return null;
  }

  return (
    <AppSheet onClose={onClose} title={title} visible>
      {plannedItemEditorVisible ? (
        <PlannedItemEditorContent
          currencyCode={draft.currencyCode}
          initialUnitCode="piece"
          onCancel={onClosePlannedItemEditor}
          onSave={onSavePlannedItem}
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
                {resolvedCurrencyLabel}
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
                {t('createList.itemCount', { count: draftItemCount })}
              </AppText>
            </AppRow>
          </AppColumn>

          {canShowCurrencySelect ? (
            <AppSelect
              helperText={t('createList.currencyHint')}
              label={t('createList.currencyLabel')}
              onValueChange={(value) => onCurrencyChange(value as SupportedCurrency)}
              options={currencyOptions}
              placeholder={t('preferences.currencySystem')}
              testID="create-list-currency"
              value={draft.currencyCode}
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
                {resolvedCurrencyLabel}
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
              onNameChange(value);
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
              onBudgetTextChange(value);
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
                onPress={onAddPlannedItem}
                testID="create-list-add-item"
              />
              {draftItemCount > 0 ? (
                <AppButton
                  accessibilityHint={t('createList.clearItemsHint')}
                  label={t('createList.clearItems')}
                  onPress={onClearItems}
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
              onPress={onSaveDraft}
              testID="create-list-save"
              variant="secondary"
            />
            <AppButton
              accessibilityHint={t('createList.finalizeHint')}
              disabled={!canSaveDraft}
              label={t('createList.finalize')}
              onPress={onFinalizeDraft}
              testID="create-list-finalize"
            />
            <AppButton
              accessibilityHint={t('createList.closeHint')}
              label={t('createList.close')}
              onPress={onClose}
              variant="ghost"
            />
          </AppRow>
        </AppColumn>
      )}
    </AppSheet>
  );
}

const styles = {
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
} as const;
