import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '@/components/RecipeCard';
import { Card, CheckRow, ProgressMeter, Text } from '@/components/ui';
import { sampleBudget, sampleRecipe, sampleShoppingList } from '@/dev/sampleData';
import { format, formatEuro, strings } from '@/i18n';
import { colors, spacing } from '@/theme';

const t = strings.showcase;

/** Design system showcase with sample data. Replaced by the real home screen later. */
export default function ShowcaseScreen() {
  const [added, setAdded] = useState(false);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const doneCount = checked.size;
  const total = sampleShoppingList.length;
  const allDone = doneCount === total;
  const budgetLeftCents = sampleBudget.totalCents - sampleBudget.usedCents;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="overline" color="accentText">
            {t.overline}
          </Text>
          <Text variant="displayLarge" accessibilityRole="header">
            {t.title}
          </Text>
        </View>

        <RecipeCard
          recipe={sampleRecipe}
          added={added}
          onAdd={() => setAdded((value) => !value)}
          onSwap={() => undefined}
        />

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="title" accessibilityRole="header">
              {t.shoppingTitle}
            </Text>
            <Text variant="label" color={allDone ? 'success' : 'textSubtle'}>
              {allDone ? t.listDone : format(t.shoppingProgress, { done: doneCount, total })}
            </Text>
          </View>
          <ProgressMeter
            value={doneCount / total}
            tone="success"
            celebrateOnComplete
            accessibilityLabel={t.shoppingTitle}
          />
          <Text variant="caption" color="textSubtle">
            {t.shoppingHint}
          </Text>
          <View>
            {sampleShoppingList.map((item) => (
              <CheckRow
                key={item.id}
                label={item.label}
                detail={item.detail}
                checked={checked.has(item.id)}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="title" accessibilityRole="header">
              {t.budgetTitle}
            </Text>
            <Text variant="number" color="textMuted">
              {format(t.budgetUsed, {
                used: formatEuro(sampleBudget.usedCents / 100),
                total: formatEuro(sampleBudget.totalCents / 100),
              })}
            </Text>
          </View>
          <ProgressMeter
            value={sampleBudget.usedCents / sampleBudget.totalCents}
            accessibilityLabel={t.budgetTitle}
          />
          <Text variant="bodyStrong" color="success">
            {format(t.budgetLeft, { amount: formatEuro(budgetLeftCents / 100) })}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
