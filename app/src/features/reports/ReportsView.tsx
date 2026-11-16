import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useShallow } from 'zustand/react/shallow';

import { QualityBadge } from '@/components/QualityBadge';
import { Button, Card, EmptyState, haptics, Icon, IconButton, ProgressMeter, Segmented, SwitchRow, Text } from '@/components/ui';
import { useNutrientReference, useWaterGoal } from '@/data/hooks';
import { useDiaryStore } from '@/data/stores/diary';
import { usePantryStore } from '@/data/stores/pantry';
import { usePlansStore } from '@/data/stores/plans';
import { useProfileStore } from '@/data/stores/profile';
import { useRemindersStore } from '@/data/stores/reminders';
import { useWaterStore } from '@/data/stores/water';
import { useWeightStore } from '@/data/stores/weight';
import { periodFor, periodReport, type PeriodKind } from '@/domain/periodReport';
import { QUALITY_GRADES } from '@/domain/qualityScore';
import { BarChart } from '@/features/diary/BarChart';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useCharacter } from '@/features/mascot/useCharacter';
import { NutrientList } from '@/features/nutrients/NutrientList';
import { dayQuality } from '@/features/quality/entryQuality';
import { WeightChart } from '@/features/weight/WeightChart';
import { format, formatInteger, formatMoney, strings } from '@/i18n';
import { activeFirstWeekday } from '@/i18n/locale';
import { formatWater, formatWeightChange } from '@/lib/amounts';
import { dayMonth, today, weekdayShort, type LocalDate } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { insights, ruleInsights, type ReportInsights } from '@/services/insights';
import { scheduleWeeklyReport } from '@/services/reminders';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.reports;
const KINDS: readonly PeriodKind[] = ['week', 'month'];
/** How far back the period arrows go. */
const MAX_BACK = { week: 52, month: 24 } as const;

export type ReportsViewProps = {
  bottomSpace: number;
};

/**
 * Päiväkirja → Raportit: a week or a month, browsed backwards. Averages,
 * charts and the character's summary describe habits; nothing is judged.
 * The report can be shared as an image.
 */
export function ReportsView({ bottomSpace }: ReportsViewProps) {
  const [kind, setKind] = useState<PeriodKind>('week');
  const [offset, setOffset] = useState(0);
  const now = today();
  const entries = useDiaryStore((s) => s.entries);
  const profile = useProfileStore(useShallow((s) => ({ goals: s.goals, hasGoal: s.hasCalorieGoal, hideCalories: s.hideCalories, weightGoal: s.weightGoal })));
  const waterByDate = useWaterStore((s) => s.byDate);
  const waterGoalMl = useWaterGoal(now).totalMl;
  const weights = useWeightStore((s) => s.entries);
  const cooked = usePantryStore((s) => s.cooked);
  const plans = usePlansStore((s) => s.plans);
  const weeklyReport = useRemindersStore((s) => s.weeklyReport);
  const setWeeklyReport = useRemindersStore((s) => s.setWeeklyReport);
  const reference = useNutrientReference();
  const { voice } = useCharacter();
  const captureTarget = useRef<ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = useState(false);

  const period = useMemo(() => periodFor(kind, offset, now, activeFirstWeekday()), [kind, offset, now]);
  const report = useMemo(
    () =>
      periodReport({
        period,
        now,
        entries,
        goals: profile.hasGoal ? profile.goals : null,
        waterByDate,
        waterGoalMl,
        weights,
        cooked,
        plans,
        gradeOf: (dayEntries) => dayQuality(dayEntries)?.grade ?? null,
      }),
    [period, now, entries, profile.hasGoal, profile.goals, waterByDate, waterGoalMl, weights, cooked, plans],
  );

  // The summary comes from the insights service (rules now, the model later); the rules show at once.
  const rulesSummary = useMemo(() => ruleInsights(report, voice, reference), [report, voice, reference]);
  const [live, setLive] = useState<{ report: typeof report; value: ReportInsights } | null>(null);
  const summary = live?.report === report ? live.value : rulesSummary;
  useEffect(() => {
    let cancelled = false;
    void insights.summarize(report, voice, reference).then((value) => {
      if (!cancelled) setLive({ report, value });
    });
    return () => {
      cancelled = true;
    };
  }, [report, voice, reference]);

  const title =
    offset === 0
      ? kind === 'week'
        ? t.thisWeek
        : t.thisMonth
      : format(t.range, { start: dayMonth(period.start), end: dayMonth(period.end) });

  const share = async () => {
    if (!captureTarget.current || sharing) return;
    setSharing(true);
    try {
      // The view-shot types predate React Native's element refs; the ref is a host view.
      const uri = await captureRef(captureTarget as unknown as Parameters<typeof captureRef>[0], { format: 'png', quality: 0.95, result: 'tmpfile' });
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing unavailable');
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t.share });
    } catch {
      showToast(t.shareError);
    } finally {
      setSharing(false);
    }
  };

  const toggleWeekly = (on: boolean) => {
    setWeeklyReport(on);
    void scheduleWeeklyReport(on).then((ok) => {
      if (on && !ok) setWeeklyReport(false);
    });
  };

  const barLabel = (date: LocalDate, index: number) =>
    kind === 'week' ? weekdayShort(date) : index % 7 === 0 ? String(Number(date.slice(8))) : '';
  const hasWeight = report.weight.points.length >= 2;

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomSpace }]}>
      <Segmented
        value={kind}
        options={KINDS.map((value) => ({ value, label: t[value] }))}
        onChange={(value) => {
          setKind(value);
          setOffset(0);
        }}
        accessibilityLabel={t.kindA11y}
      />
      <View style={styles.nav}>
        <IconButton
          icon="chevronLeft"
          accessibilityLabel={t.prev}
          disabled={offset >= MAX_BACK[kind]}
          onPress={() => setOffset((value) => value + 1)}
        />
        <Text variant="title" accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.navTitle}>
          {title}
        </Text>
        <IconButton icon="chevronRight" accessibilityLabel={t.next} disabled={offset === 0} onPress={() => setOffset((value) => value - 1)} />
      </View>

      <View ref={captureTarget} collapsable={false} style={styles.capture}>
        <Card style={styles.gap}>
          <Text variant="overline" color="accentText">
            {t.summaryTitle}
          </Text>
          <MascotSays state={report.loggedDays > 0 ? 'happy' : 'encouraging'} message={summary.opening} size={56} />
          {summary.observations.map((line) => (
            <View key={line} style={styles.bullet}>
              <Icon name="check" size={16} color="success" />
              <Text variant="body" style={styles.flex}>
                {line}
              </Text>
            </View>
          ))}
          <View style={styles.suggestion}>
            <Text variant="label" color="accentText">
              {t.suggestionTitle}
            </Text>
            <Text variant="body">{summary.suggestion}</Text>
          </View>
        </Card>

        {report.loggedDays === 0 && report.cooked.count === 0 && report.water.daysWithWater === 0 ? (
          <EmptyState icon="chart" mascot="sleepy" title={t.emptyTitle} body={t.emptyBody} />
        ) : (
          <>
            <View style={styles.tiles}>
              <Tile label={t.loggedDays} value={format(t.loggedValue, { count: report.loggedDays, days: report.elapsedDays })} />
              <Tile label={t.streak} value={format(t.daysValue, { count: report.longestStreak })} />
              <Tile label={t.water} value={report.water.daysWithWater > 0 ? formatWater(report.water.avgMl) : '–'} />
              <Tile label={t.waterGoalDays} value={format(t.daysValue, { count: report.water.goalDays })} />
              <Tile label={t.cooked} value={formatInteger(report.cooked.count)} />
              <Tile label={t.pantryUsed} value={format(t.pantryUsedValue, { count: report.pantry.itemsUsed })} />
              {report.savingsCents > 0 ? <Tile label={t.savings} value={formatMoney(report.savingsCents)} /> : null}
            </View>

            {profile.hideCalories || report.loggedDays === 0 ? null : (
              <Card style={styles.gap}>
                <Text variant="heading">{t.energyTitle}</Text>
                <Text variant="caption" color="textSubtle">
                  {format(t.energyAvg, { value: formatInteger(report.avg.kcal) })}
                </Text>
                <BarChart
                  bars={report.days.map((day, index) => ({
                    key: day.date,
                    label: barLabel(day.date, index),
                    value: day.kcal,
                    muted: !day.logged,
                    a11y: `${dayMonth(day.date)} ${formatInteger(day.kcal)} kcal`,
                  }))}
                  reference={report.goals?.kcal ?? null}
                  format={(value) => formatInteger(value)}
                />
              </Card>
            )}

            {profile.hideCalories || report.loggedDays === 0 ? null : (
              <Card style={styles.gap}>
                <Text variant="heading">{t.macrosTitle}</Text>
                <MacroRow label={strings.macros.protein} value={report.avg.proteinG} goal={report.goals?.proteinG} />
                <MacroRow label={strings.macros.carbsLong} value={report.avg.carbsG} goal={report.goals?.carbsG} />
                <MacroRow label={strings.macros.fat} value={report.avg.fatG} goal={report.goals?.fatG} />
              </Card>
            )}

            {profile.hideCalories ? null : (
              <Card style={styles.gap}>
                <Text variant="heading">{t.weightTitle}</Text>
                {hasWeight ? (
                  <>
                    <WeightChart entries={report.weight.points} targetKg={profile.weightGoal.targetWeightKg} />
                    {report.weight.changeKg !== null ? (
                      <Text variant="caption" color="textSubtle">
                        {format(t.weightChange, { value: formatWeightChange(report.weight.changeKg) })}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text variant="body" color="textMuted">
                    {t.weightNone}
                  </Text>
                )}
              </Card>
            )}

            <Card style={styles.gap}>
              <Text variant="heading">{t.qualityTitle}</Text>
              {QUALITY_GRADES.some((g) => report.grades[g] > 0) ? (
                <View style={styles.grades}>
                  {QUALITY_GRADES.map((grade) => {
                    const count = report.grades[grade];
                    return (
                      <View key={grade} style={styles.grade} accessible accessibilityLabel={format(t.qualityA11y, { grade, count })}>
                        <QualityBadge grade={grade} />
                        <ProgressMeter value={report.loggedDays > 0 ? count / report.loggedDays : 0} size="thin" accessibilityLabel={grade} />
                        <Text variant="label" color="textMuted">
                          {formatInteger(count)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text variant="body" color="textMuted">
                  {t.qualityNone}
                </Text>
              )}
            </Card>

            {report.loggedDays > 0 ? (
              <Card style={styles.gap}>
                <Text variant="heading">{t.nutrientsTitle}</Text>
                <NutrientList values={report.nutrients} reference={reference} />
              </Card>
            ) : null}

            <Text variant="caption" color="textSubtle">
              {t.neutral}
            </Text>
          </>
        )}
      </View>

      <Button
        label={t.share}
        variant="secondary"
        disabled={sharing}
        icon={<Icon name="share" size={20} />}
        onPress={() => {
          haptics.tap();
          void share();
        }}
      />
      <SwitchRow label={t.notify} hint={t.notifyHint} value={weeklyReport} onValueChange={toggleWeekly} />
    </ScrollView>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="caption" color="textSubtle">
        {label}
      </Text>
      <Text variant="title" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
    </View>
  );
}

function MacroRow({ label, value, goal }: { label: string; value: number; goal: number | undefined }) {
  const text = goal
    ? format(t.macroGoal, { value: formatInteger(value), goal: formatInteger(goal) })
    : format(t.macroValue, { value: formatInteger(value) });
  return (
    <View style={styles.macro}>
      <View style={styles.macroTop}>
        <Text variant="label" color="textMuted" style={styles.flex}>
          {label}
        </Text>
        <Text variant="label">{text}</Text>
      </View>
      {goal ? <ProgressMeter value={value / goal} size="thin" accessibilityLabel={`${label} ${text}`} /> : null}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.lg,
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    navTitle: {
      flex: 1,
      textAlign: 'center',
    },
    capture: {
      gap: spacing.lg,
      backgroundColor: colors.bg,
    },
    gap: {
      gap: spacing.md,
    },
    flex: {
      flex: 1,
    },
    bullet: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    suggestion: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.accentSoft,
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
    macro: {
      gap: spacing.xs,
    },
    macroTop: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    grades: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    grade: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
  }),
);
