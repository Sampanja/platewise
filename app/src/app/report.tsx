import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, EmptyState, FadeInView, PressableScale, ProgressMeter, Text } from '@/components/ui';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import { useWaterStore } from '@/data/stores/water';
import { DIARY_MEALS } from '@/domain/diary';
import { dayReport, REFERENCE, weekReport } from '@/domain/report';
import { BarChart } from '@/features/diary/BarChart';
import { format, formatDecimal, formatInteger, strings } from '@/i18n';
import { diaryDayLabel, parseLocalDate, today, type LocalDate } from '@/lib/dates';
import { colors, radii, spacing, themedStyles, type ColorToken } from '@/theme';

const t = strings.report;
type View_ = 'day' | 'week';

/** Day and week reports. Describes what was logged; never judges it. */
export default function ReportScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date: LocalDate = params.date || today();
  const [view, setView] = useState<View_>('day');
  const entries = useDiaryStore((s) => s.entries);
  const goals = useProfileStore((s) => s.goals);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const hideCalories = useProfileStore((s) => s.hideCalories);
  const water = useWaterStore((s) => s.byDate);
  const waterGoal = useWaterStore((s) => s.goalMl);

  const day = useMemo(() => dayReport(entries, date), [entries, date]);
  const week = useMemo(() => weekReport(entries, date, hasGoal ? goals : null, water), [entries, date, hasGoal, goals, water]);
  const weekday = (d: LocalDate) => strings.dates.weekdaysShort[parseLocalDate(d).getDay()];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.title} />
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['day', 'week'] as const).map((value) => {
          const selected = view === value;
          return (
            <PressableScale
              key={value}
              haptic="select"
              onPress={() => setView(value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text variant="bodyStrong" color={selected ? 'textOnAccent' : 'textMuted'}>
                {value === 'day' ? t.day : t.week}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {view === 'day' ? (
          <FadeInView key="day" style={styles.gap}>
            <Text variant="title" accessibilityRole="header">
              {diaryDayLabel(date)}
            </Text>
            {day.entryCount === 0 ? (
              <EmptyState icon="chart" title={t.emptyDayTitle} body={t.emptyDayBody} />
            ) : (
              <>
                {hideCalories ? null : (
                  <Card style={styles.gap}>
                    <Text variant="heading">{t.byMeal}</Text>
                    {DIARY_MEALS.map((meal) => (
                      <View key={meal} style={styles.mealRow}>
                        <View style={styles.rowBetween}>
                          <Text variant="label" color="textMuted">
                            {strings.diaryMeals[meal]}
                          </Text>
                          <Text variant="label">{format(strings.common.kcal, { value: formatInteger(day.byMeal[meal]) })}</Text>
                        </View>
                        <ProgressMeter
                          value={day.totals.kcal > 0 ? day.byMeal[meal] / day.totals.kcal : 0}
                          size="thin"
                          accessibilityLabel={`${strings.diaryMeals[meal]} ${formatInteger(day.byMeal[meal])} kcal`}
                        />
                      </View>
                    ))}
                  </Card>
                )}

                {hideCalories ? null : (
                  <Card style={styles.gap}>
                    <Text variant="heading">{t.split}</Text>
                    <View
                      style={styles.split}
                      accessible
                      accessibilityLabel={format(t.splitA11y, {
                        protein: day.split.proteinPct,
                        carbs: day.split.carbsPct,
                        fat: day.split.fatPct,
                      })}
                    >
                      <View style={[styles.segment, { flex: day.split.proteinPct, backgroundColor: colors.herb }]} />
                      <View style={[styles.segment, { flex: day.split.carbsPct, backgroundColor: colors.accent }]} />
                      <View style={[styles.segment, { flex: day.split.fatPct, backgroundColor: colors.berry }]} />
                    </View>
                    <View style={styles.legend}>
                      <Legend color="herb" label={`${strings.macros.protein} ${day.split.proteinPct} %`} />
                      <Legend color="accent" label={`${strings.macros.carbs} ${day.split.carbsPct} %`} />
                      <Legend color="berry" label={`${strings.macros.fat} ${day.split.fatPct} %`} />
                    </View>
                  </Card>
                )}

                <Card style={styles.gap}>
                  <Text variant="heading">{t.micros}</Text>
                  <MicroRow label={strings.micros.fiber} value={day.totals.fiberG} hint={strings.micros.fiberRef} goal={REFERENCE.fiberMinG} />
                  <MicroRow label={strings.micros.sugar} value={day.totals.sugarG} />
                  <MicroRow label={strings.micros.salt} value={day.totals.saltG} hint={strings.micros.saltRef} goal={REFERENCE.saltMaxG} />
                  {day.entriesWithoutMicros > 0 ? (
                    <Text variant="caption" color="textSubtle">
                      {strings.micros.partial}
                    </Text>
                  ) : null}
                </Card>
              </>
            )}

            <Card style={styles.gap}>
              <Text variant="heading">{t.water}</Text>
              <View style={styles.rowBetween}>
                <Text variant="body" color="textMuted">
                  {format(strings.water.amount, {
                    value: formatDecimal((water[date] ?? 0) / 1000, 2),
                    goal: formatDecimal(waterGoal / 1000, 2),
                  })}
                </Text>
              </View>
              <ProgressMeter value={(water[date] ?? 0) / waterGoal} size="thin" tone="success" accessibilityLabel={t.water} />
            </Card>
          </FadeInView>
        ) : (
          <FadeInView key="week" style={styles.gap}>
            {week.loggedDays === 0 ? (
              <EmptyState icon="chart" title={t.emptyWeekTitle} body={t.emptyWeekBody} />
            ) : (
              <>
                <View style={styles.tiles}>
                  {hideCalories ? null : (
                    <Tile label={t.avgKcal} value={formatInteger(week.avgKcal)} unit={t.avgKcalUnit} />
                  )}
                  <Tile label={t.loggedDays} value={format(t.loggedDaysValue, { count: week.loggedDays })} />
                  {hasGoal && !hideCalories ? (
                    <Tile label={t.proteinDays} value={format(t.proteinDaysValue, { count: week.proteinGoalDays })} />
                  ) : null}
                  {hasGoal && !hideCalories ? (
                    <Tile label={t.onTarget} value={format(t.onTargetValue, { count: week.onTargetDays })} />
                  ) : null}
                  <Tile label={t.avgWater} value={`${formatDecimal(week.avgWaterMl / 1000, 2)} l`} />
                </View>
                {hideCalories ? null : (
                  <Card style={styles.gap}>
                    <Text variant="heading">{t.weekKcal}</Text>
                    <BarChart
                      bars={week.days.map((d) => ({
                        key: d.date,
                        label: weekday(d.date),
                        value: d.kcal,
                        muted: !d.logged,
                        a11y: `${weekday(d.date)} ${formatInteger(d.kcal)} kcal`,
                      }))}
                      reference={hasGoal ? goals.kcal : null}
                      format={(v) => formatInteger(v)}
                    />
                  </Card>
                )}
                {hideCalories ? null : (
                  <Card style={styles.gap}>
                    <Text variant="heading">{t.weekProtein}</Text>
                    <BarChart
                      tone="herb"
                      bars={week.days.map((d) => ({
                        key: d.date,
                        label: weekday(d.date),
                        value: d.proteinG,
                        a11y: `${weekday(d.date)} ${formatInteger(d.proteinG)} g`,
                      }))}
                      reference={hasGoal ? goals.proteinG : null}
                      format={(v) => `${formatInteger(v)}`}
                    />
                  </Card>
                )}
              </>
            )}
          </FadeInView>
        )}
        <Text variant="caption" color="textSubtle">
          {t.neutral}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: ColorToken; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: colors[color] }]} />
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

function MicroRow({ label, value, hint, goal }: { label: string; value: number | undefined; hint?: string; goal?: number }) {
  const text = value === undefined ? strings.nutrients.unknown : `${formatDecimal(value)} g`;
  return (
    <View style={styles.mealRow}>
      <View style={styles.rowBetween}>
        <Text variant="label" color="textMuted">
          {hint ? `${label} (${hint})` : label}
        </Text>
        <Text variant="label">{text}</Text>
      </View>
      {goal !== undefined && value !== undefined ? (
        <ProgressMeter value={value / goal} size="thin" accessibilityLabel={`${label} ${text}`} />
      ) : null}
    </View>
  );
}

function Tile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ''}`}>
      <Text variant="caption" color="textSubtle">
        {label}
      </Text>
      <Text variant="title">{value}</Text>
      {unit ? (
        <Text variant="caption" color="textSubtle">
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    tabs: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      padding: spacing.xs,
      gap: spacing.xs,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
    },
    tab: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.pill,
    },
    tabSelected: {
      backgroundColor: colors.accent,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    gap: {
      gap: spacing.md,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    mealRow: {
      gap: spacing.xs,
    },
    split: {
      flexDirection: 'row',
      height: 16,
      borderRadius: radii.pill,
      overflow: 'hidden',
      gap: 2,
    },
    segment: {
      height: '100%',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    tiles: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tile: {
      flexGrow: 1,
      flexBasis: '45%',
      gap: spacing.xxs,
      padding: spacing.lg,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
  }),
);
