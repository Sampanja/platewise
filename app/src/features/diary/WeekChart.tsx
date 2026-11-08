import { StyleSheet, View } from 'react-native';

import { Card, PressableScale, Text } from '@/components/ui';
import { format, formatInteger, strings } from '@/i18n';
import { parseLocalDate, type LocalDate } from '@/lib/dates';
import { colors, radii, spacing } from '@/theme';

type Props = {
  days: readonly { date: LocalDate; kcal: number }[];
  selected: LocalDate;
  /** Calorie goal for the dashed line; null without a goal. */
  goal: number | null;
  onSelect: (date: LocalDate) => void;
};

const CHART_HEIGHT = 120;

/** Seven bars of daily calories. Neutral colours: over the goal is just a taller bar. */
export function WeekChart({ days, selected, goal, onSelect }: Props) {
  const max = Math.max(goal ?? 0, ...days.map((d) => d.kcal), 1) * 1.1;

  return (
    <Card style={styles.card}>
      <Text variant="heading" accessibilityRole="header">
        {strings.diary.weekTitle}
      </Text>
      <View style={styles.chart}>
        {goal ? <View style={[styles.goalLine, { bottom: (goal / max) * CHART_HEIGHT }]} /> : null}
        {days.map((day) => {
          const isSelected = day.date === selected;
          const weekday = strings.dates.weekdaysShort[parseLocalDate(day.date).getDay()];
          return (
            <PressableScale
              key={day.date}
              haptic="select"
              onPress={() => onSelect(day.date)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={format(strings.diary.weekA11y, { day: weekday, value: formatInteger(day.kcal) })}
              style={styles.column}
            >
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(4, (day.kcal / max) * CHART_HEIGHT) },
                    day.kcal === 0 && styles.barEmpty,
                    isSelected && styles.barSelected,
                  ]}
                />
              </View>
              <Text variant="caption" color={isSelected ? 'accentText' : 'textSubtle'}>
                {weekday}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Offset by the weekday labels under the bars.
    marginBottom: 26,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textSubtle,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '62%',
    borderRadius: radii.sm,
    backgroundColor: colors.textSubtle,
  },
  barEmpty: {
    backgroundColor: colors.surfaceRaised,
  },
  barSelected: {
    backgroundColor: colors.accent,
  },
});
