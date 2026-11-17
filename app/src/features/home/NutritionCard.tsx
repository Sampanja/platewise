import { StyleSheet, View } from 'react-native';

import { Card, Icon, PressableScale, ProgressMeter, Ring, Text } from '@/components/ui';
import type { DayNutrition } from '@/data/types';
import { format, formatInteger, strings } from '@/i18n';
import { energyUnitLabel, formatEnergy, formatEnergyBare, formatNutrientGrams } from '@/lib/amounts';
import { spacing, themedStyles } from '@/theme';

type Props = {
  nutrition: DayNutrition;
  /** Without a calorie goal the card shows plain totals, no progress against a target. */
  hasGoal: boolean;
  /** "Piilota kalorit": show only how many entries were logged, no numbers. */
  hideCalories?: boolean;
  entryCount?: number;
  onOpenDiary: () => void;
};

/** Today's calories and macros against the user's goals. Taps through to the diary. */
export function NutritionCard({ nutrition, hasGoal, hideCalories = false, entryCount = 0, onOpenDiary }: Props) {
  const t = strings.home;
  const { eaten, goals } = nutrition;
  const isEmpty = eaten.kcal === 0;

  return (
    <PressableScale
      onPress={onOpenDiary}
      accessibilityRole="button"
      accessibilityLabel={`${t.nutritionTitle}. ${t.nutritionOpen}`}
      accessibilityHint={format(t.kcalA11y, {
        value: formatEnergy(eaten.kcal),
        goal: formatEnergy(goals.kcal),
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

        {hideCalories ? (
          <Text variant="body" color="textMuted">
            {entryCount > 0
              ? format(strings.hideCalories.homeEntries, { count: entryCount })
              : strings.hideCalories.homeEntriesNone}
          </Text>
        ) : (
        <View style={styles.body}>
          <Ring
            value={hasGoal ? eaten.kcal / goals.kcal : 0}
            accessibilityLabel={format(t.kcalA11y, {
              value: formatEnergy(eaten.kcal),
              goal: formatEnergy(goals.kcal),
            })}
          >
            <Text variant="title" style={styles.tabular}>
              {formatEnergyBare(eaten.kcal)}
            </Text>
            <Text variant="caption" color="textSubtle" maxFontSizeMultiplier={1.3}>
              {hasGoal ? format(t.kcalOfGoal, { goal: formatEnergy(goals.kcal) }) : energyUnitLabel()}
            </Text>
          </Ring>

          {isEmpty ? (
            <Text variant="body" color="textMuted" style={styles.macros}>
              {t.nutritionEmpty}
            </Text>
          ) : (
            <View style={styles.macros}>
              <MacroRow label={strings.macros.protein} value={eaten.proteinG} goal={hasGoal ? goals.proteinG : null} />
              <MacroRow label={strings.macros.carbsLong} value={eaten.carbsG} goal={hasGoal ? goals.carbsG : null} />
              <MacroRow label={strings.macros.fat} value={eaten.fatG} goal={hasGoal ? goals.fatG : null} />
            </View>
          )}
        </View>
        )}
      </Card>
    </PressableScale>
  );
}

function MacroRow({ label, value, goal }: { label: string; value: number; goal: number | null }) {
  const text =
    goal === null
      ? formatNutrientGrams(value)
      : format(strings.home.macroOfGoal, { value: formatInteger(value), goal: formatInteger(goal) });
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
      {goal === null ? null : (
        <ProgressMeter value={value / goal} size="thin" accessibilityLabel={`${label} ${text}`} />
      )}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
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
  }),
);
