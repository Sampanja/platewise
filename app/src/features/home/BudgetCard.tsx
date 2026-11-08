import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Icon, ProgressMeter, Text } from '@/components/ui';
import type { MealPlan } from '@/data/types';
import { budgetHeadroomCents } from '@/domain/plan';
import { format, formatCents, strings } from '@/i18n';
import { spacing } from '@/theme';

type Props = {
  plan: MealPlan;
  /** Ticked / all items on the shopping list. */
  shoppingDone: number;
  shoppingTotal: number;
};

/** "42 € / 50 €": the plan's price estimate against its budget, and the way to the shopping list. */
export function BudgetCard({ plan, shoppingDone, shoppingTotal }: Props) {
  const t = strings.home;
  const headroom = budgetHeadroomCents(plan);
  const used = formatCents(plan.estimatedTotalCents);
  const total = formatCents(plan.budgetCents);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header" style={styles.flex}>
          {t.budgetTitle}
        </Text>
        <Text variant="number">{format(t.budgetUsed, { used, total })}</Text>
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
      <Button
        label={t.shoppingList}
        variant="secondary"
        icon={<Icon name="basket" size={20} color="text" />}
        onPress={() => router.push('/shopping-list')}
        accessibilityHint={format(t.shoppingProgress, { done: shoppingDone, total: shoppingTotal })}
      />
      {shoppingTotal > 0 ? (
        <Text variant="caption" color="textSubtle" style={styles.center}>
          {format(t.shoppingProgress, { done: shoppingDone, total: shoppingTotal })}
        </Text>
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
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
});
