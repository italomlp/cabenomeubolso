import { useAppTheme } from '@/design-system/theme-context';
import { AppColumn, AppText } from '@/components/ui';

type Props = { actualLabel: string; budgetLabel: string; budget: string; actual: string; remaining: string; status: string; risk: boolean };

export function BudgetRail({ actualLabel, budgetLabel, budget, actual, remaining, status, risk }: Props) {
  const theme = useAppTheme();
  return (
    <AppColumn spacing={theme.space.xs} style={{ backgroundColor: theme.colors.surfaceRaised, borderColor: risk ? theme.colors.budgetRisk : theme.colors.budgetSafe, borderWidth: 1, borderRadius: theme.radius.md, padding: theme.space.md }}>
      <AppColumn spacing={theme.space.sm}>
        <AppColumn spacing={0}><AppText>{budgetLabel}</AppText><AppText textStyle={{ color: theme.colors.onSurface, fontSize: theme.typography.numeric.fontSize, fontWeight: theme.typography.numeric.fontWeight }}>{budget}</AppText></AppColumn>
        <AppColumn spacing={0}><AppText>{actualLabel}</AppText><AppText textStyle={{ color: theme.colors.onSurface, fontSize: theme.typography.numeric.fontSize, fontWeight: theme.typography.numeric.fontWeight }}>{actual}</AppText></AppColumn>
        <AppColumn spacing={0}><AppText>{status}</AppText><AppText textStyle={{ color: risk ? theme.colors.budgetRisk : theme.colors.budgetSafe, fontSize: theme.typography.numeric.fontSize, fontWeight: '700' }}>{remaining}</AppText></AppColumn>
      </AppColumn>
    </AppColumn>
  );
}
