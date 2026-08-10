import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingList } from '@/domain/shopping-list';
import { useAppTheme } from '@/design-system/theme-context';

import { AppButton, AppColumn, AppRow, AppText } from '@/components/ui';

type ListCardProps = {
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

export function ListCard({
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
}: ListCardProps) {
  const theme = useAppTheme();
  const visibleItemCount = list.items.filter((item) => item.deletedAt === null).length;
  const currencyText = resolveCurrency(list.currencyCode);
  const actionLabel = list.status === 'finalized' ? reopenLabel : editLabel;

  return (
    <AppColumn
      spacing={theme.space.sm}
      style={{
        backgroundColor: theme.colors.backgroundElement,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        padding: theme.space.md,
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
          {statusLabel}
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
          accessibilityHint={actionLabel}
          label={actionLabel}
          onPress={() => (list.status === 'finalized' ? onReopenAndEdit(list.id) : onLoad(list))}
          testID={`load-${list.id}`}
          variant="secondary"
        />
        {list.status !== 'finalized' ? <AppButton label={finalizeLabel} onPress={() => onFinalize(list.id)} testID={`finalize-${list.id}`} /> : null}
      </AppRow>
    </AppColumn>
  );
}
