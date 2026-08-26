import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppRow, AppSelect, AppText, AppTextField } from '@/components/ui';
import type { ObservableState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingListItem } from '@/domain/shopping-list';
import { formatCurrencyMinor, formatQuantityMilli } from '@/lib/locale-input';
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
  plannedItemInitialItem?: PlannedItemDraft;
  resolvedCurrencyLabel: string;
  title: string;
  visible: boolean;
  onAddPlannedItem: () => void;
  onEditPlannedItem?: (item: ShoppingListItem) => void;
  onRemovePlannedItem?: (itemId: string) => void;
  onBudgetTextChange: (value: string) => void;
  onClearItems: () => void;
  onClose: () => void;
  onCurrencyChange: (value: SupportedCurrency) => void;
  onFinalizeDraft: () => void;
  onClosePlannedItemEditor: () => void;
  onNameChange: (value: string) => void;
  onSaveDraft: () => void;
  onSavePlannedItem: (draft: PlannedItemDraft) => void;
  onReopenList?: () => void;
  showClearItems?: boolean;
  showItemActions?: boolean;
  showDraftSummary?: boolean;
  showItemPreview?: boolean;
  children?: ReactNode;
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
  plannedItemInitialItem,
  resolvedCurrencyLabel,
  title,
  visible,
  onAddPlannedItem,
  onEditPlannedItem,
  onRemovePlannedItem,
  onBudgetTextChange,
  onClearItems,
  onClose,
  onCurrencyChange,
  onFinalizeDraft,
  onClosePlannedItemEditor,
  onNameChange,
  onReopenList,
  showClearItems = true,
  showItemActions = true,
  showDraftSummary = true,
  showItemPreview = true,
  onSaveDraft,
  onSavePlannedItem,
  children,
}: ListFormSheetProps) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });

  if (!visible || draft === null) {
    return null;
  }

  const canShowCurrencySelect = draftItemCount === 0 && draft.status !== 'finalized';
  const isReadOnly = draft.status === 'finalized';
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const visibleItems = draft.items.filter((item) => item.deletedAt === null);

  return (
    <AppColumn spacing={theme.space.md} style={{ padding: theme.space.content }}>
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

      {plannedItemEditorVisible ? (
        <PlannedItemEditorContent
          currencyCode={draft.currencyCode}
          initialItem={plannedItemInitialItem}
          initialUnitCode="piece"
          onCancel={onClosePlannedItemEditor}
          onSave={onSavePlannedItem}
        />
      ) : (
        <AppColumn spacing={theme.space.md}>
          {showDraftSummary ? <AppColumn
            spacing={theme.space.xs}
            style={{
              backgroundColor: theme.colors.backgroundElement,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              padding: theme.space.sm,
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
          </AppColumn> : null}

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
            editable={!isReadOnly}
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
            editable={!isReadOnly}
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
            {!isReadOnly ? (
              <AppRow spacing={theme.space.sm}>
                <AppButton
                  accessibilityHint={t('createList.addItemHint')}
                  label={t('createList.addItem')}
                  onPress={onAddPlannedItem}
                  testID="create-list-add-item"
                />
                {showClearItems && draftItemCount > 0 ? (
                  <AppButton
                    accessibilityHint={t('createList.clearItemsHint')}
                    label={t('createList.clearItems')}
                    onPress={onClearItems}
                    testID="create-list-clear-items"
                    variant="ghost"
                  />
                ) : null}
              </AppRow>
            ) : null}
          </AppColumn>

          {showItemPreview && visibleItems.length > 0 ? (
            <AppColumn spacing={theme.space.xs}>
              <AppText
                textStyle={{
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.label.fontSize,
                  fontWeight: theme.typography.label.fontWeight,
                  lineHeight: theme.typography.label.lineHeight,
                }}
              >
                {t('createList.itemsPreviewTitle')}
              </AppText>
              {visibleItems.map((item) => {
                const unitLabel = t(`units.${item.unitCode}`);

                return (
                  <AppColumn
                    key={item.id}
                    spacing={theme.space.xs}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                      paddingVertical: theme.space.sm,
                    }}
                  >
                    <AppText>{item.name}</AppText>
                    <AppText>
                      {t('createList.itemPreviewDetails', {
                        price: formatCurrencyMinor(locale, item.plannedUnitMinor, draft.currencyCode),
                        quantity: formatQuantityMilli(locale, item.unitCode, item.quantityMilli),
                        unit: unitLabel,
                      })}
                    </AppText>
                    {!isReadOnly && showItemActions && onEditPlannedItem !== undefined && onRemovePlannedItem !== undefined ? (
                      <AppRow spacing={theme.space.sm}>
                        <AppButton
                          accessibilityHint={t('plannedItem.editHint')}
                          label={t('plannedItem.edit')}
                          onPress={() => onEditPlannedItem(item)}
                          testID={`edit-planned-item-${item.id}`}
                          variant="secondary"
                        />
                        <AppButton
                          accessibilityHint={t('plannedItem.removeHint')}
                          label={t('plannedItem.remove')}
                          onPress={() => onRemovePlannedItem(item.id)}
                          testID={`remove-planned-item-${item.id}`}
                          variant="destructive"
                        />
                      </AppRow>
                    ) : null}
                  </AppColumn>
                );
              })}
            </AppColumn>
          ) : null}

          {isReadOnly && onReopenList !== undefined ? (
            <AppColumn spacing={theme.space.sm}>
              <AppButton
                accessibilityHint={t('listDetail.reopenHint')}
                label={t('listDetail.reopenLabel')}
                onPress={onReopenList}
                testID="list-detail-reopen"
                variant="secondary"
              />
              <AppButton accessibilityHint={t('createList.closeHint')} label={t('createList.close')} onPress={onClose} variant="ghost" />
            </AppColumn>
          ) : (
            <AppColumn spacing={theme.space.sm}>
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
            </AppColumn>
          )}

          {children}
        </AppColumn>
      )}
    </AppColumn>
  );
}
