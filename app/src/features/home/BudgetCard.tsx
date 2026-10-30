import { StyleSheet, View } from 'react-native';

import { Card, Icon, ProgressMeter, Text } from '@/components/ui';
import type { MealPlan } from '@/data/types';
import { budgetHeadroomCents } from '@/domain/plan';
import { format, formatCents, strings } from '@/i18n';
import { colors, spacing } from '@/theme';

type Props = {
  plan: MealPlan;
  /** This month's savings across accepted plans; hidden when zero or unknown. */
  monthSavingsCents: number | undefined;
};

export function BudgetCard({ plan, monthSavingsCents }: Props) {
  const t = strings.home;
  const headroom = budgetHeadroomCents(plan);
  const used = formatCents(plan.estimatedTotalCents);
  const total = formatCents(plan.budgetCents);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.budgetTitle}
        </Text>
        <Text variant="number" color="textMuted">
          {format(t.budgetUsed, { used, total })}
        </Text>
      </View>
      <ProgressMeter
        value={plan.estimatedTotalCents / plan.budgetCents}
        accessibilityLabel={format(t.budgetA11y, { used, total })}
      />
      {/* Going over budget is shown plainly, not as an alarm: the user chose it. */}
      <Text variant="bodyStrong" color={headroom >= 0 ? 'success' : 'accentText'}>
        {headroom >= 0
          ? format(t.budgetLeft, { amount: formatCents(headroom) })
          : format(t.budgetOver, { amount: formatCents(-headroom) })}
      </Text>
      <Text variant="caption" color="textSubtle">
        {strings.budget.explainer}
      </Text>

      {monthSavingsCents && monthSavingsCents > 0 ? (
        <View style={styles.savings}>
          <View style={styles.savingsIcon}>
            <Icon name="savings" size={20} color="success" />
          </View>
          <Text variant="label" color="success" style={styles.savingsText}>
            {format(t.savings, { amount: formatCents(monthSavingsCents) })}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  savings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  savingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsText: {
    flex: 1,
  },
});
