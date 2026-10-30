import { StyleSheet, View } from 'react-native';

import { Card, Icon, PressableScale, ProgressMeter, Ring, Text } from '@/components/ui';
import type { DayNutrition } from '@/data/types';
import { format, formatInteger, strings } from '@/i18n';
import { spacing } from '@/theme';

type Props = {
  nutrition: DayNutrition;
  onOpenDiary: () => void;
};

/** Today's calories and macros against the user's goals. Taps through to the diary. */
export function NutritionCard({ nutrition, onOpenDiary }: Props) {
  const t = strings.home;
  const { eaten, goals } = nutrition;
  const isEmpty = eaten.kcal === 0;

  return (
    <PressableScale
      onPress={onOpenDiary}
      accessibilityRole="button"
      accessibilityLabel={`${t.nutritionTitle}. ${t.nutritionOpen}`}
      accessibilityHint={format(t.kcalA11y, {
        value: formatInteger(eaten.kcal),
        goal: formatInteger(goals.kcal),
      })}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text variant="heading">{t.nutritionTitle}</Text>
          <View style={styles.open}>
            <Text variant="label" color="accentText">
              {t.nutritionOpen}
            </Text>
            <Icon name="chevronRight" size={18} color="accentText" />
          </View>
        </View>

        <View style={styles.body}>
          <Ring
            value={eaten.kcal / goals.kcal}
            accessibilityLabel={format(t.kcalA11y, {
              value: formatInteger(eaten.kcal),
              goal: formatInteger(goals.kcal),
            })}
          >
            <Text variant="title" style={styles.tabular}>
              {formatInteger(eaten.kcal)}
            </Text>
            <Text variant="caption" color="textSubtle" maxFontSizeMultiplier={1.3}>
              {format(t.kcalOfGoal, { goal: formatInteger(goals.kcal) })}
            </Text>
          </Ring>

          {isEmpty ? (
            <Text variant="body" color="textMuted" style={styles.macros}>
              {t.nutritionEmpty}
            </Text>
          ) : (
            <View style={styles.macros}>
              <MacroRow label={strings.macros.protein} value={eaten.proteinG} goal={goals.proteinG} />
              <MacroRow label={strings.macros.carbsLong} value={eaten.carbsG} goal={goals.carbsG} />
              <MacroRow label={strings.macros.fat} value={eaten.fatG} goal={goals.fatG} />
            </View>
          )}
        </View>
      </Card>
    </PressableScale>
  );
}

function MacroRow({ label, value, goal }: { label: string; value: number; goal: number }) {
  const text = format(strings.home.macroOfGoal, {
    value: formatInteger(value),
    goal: formatInteger(goal),
  });
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabels}>
        <Text variant="label" color="textMuted">
          {label}
        </Text>
        <Text variant="label" style={styles.tabular}>
          {text}
        </Text>
      </View>
      <ProgressMeter value={value / goal} size="thin" accessibilityLabel={`${label} ${text}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  open: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  macros: {
    flex: 1,
    gap: spacing.md,
  },
  macroRow: {
    gap: spacing.xs,
  },
  macroLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
