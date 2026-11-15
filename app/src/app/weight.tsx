import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  Button,
  Card,
  EmptyState,
  haptics,
  Icon,
  IconButton,
  ProgressMeter,
  Text,
} from '@/components/ui';
import { useProfileStore } from '@/data/stores/profile';
import { useWeightStore } from '@/data/stores/weight';
import { forecastDate, goalDate, goalProgress, milestones, movingAverage, shouldSuggestRecalculation } from '@/domain/energy';
import { CheckInCard } from '@/features/weight/CheckInCard';
import { WeightChart } from '@/features/weight/WeightChart';
import { displayWeight, weightStep, weightToKg } from '@/domain/units';
import { format, formatFixed, strings } from '@/i18n';
import { activeUnitSystem } from '@/i18n/locale';
import { formatBodyWeight, formatWeightChange } from '@/lib/amounts';
import { diaryDayLabel, numericDate, today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.weight;
const kg = (value: number) => formatBodyWeight(value);
/** A weight in the user's unit without the unit, e.g. "72,5" or "159.8". */
const bare = (value: number) => formatFixed(displayWeight(value, activeUnitSystem()), 1);

/** Weight log: today's weigh-in, trend chart with a moving average and progress to the goal. */
export default function WeightScreen() {
  const entries = useWeightStore((s) => s.entries);
  const log = useWeightStore((s) => s.log);
  const remove = useWeightStore((s) => s.remove);
  const restore = useWeightStore((s) => s.restore);
  const body = useProfileStore((s) => s.body);
  const goal = useProfileStore((s) => s.weightGoal);

  const todayEntry = entries.find((e) => e.date === today());
  const [value, setValue] = useState(todayEntry?.kg ?? entries.at(-1)?.kg ?? body.weightKg ?? 75);

  const trend = movingAverage(entries).at(-1)?.kg ?? null;
  const target = goal.type === 'lose' || goal.type === 'gain' ? goal.targetWeightKg : null;
  const forecast = target !== null ? forecastDate(entries, target, new Date()) : null;
  const planned =
    target !== null && goal.setAt && goal.startWeightKg !== null && goal.rateKgPerWeek > 0
      ? goalDate(new Date(goal.setAt), Math.ceil(Math.abs(target - goal.startWeightKg) / goal.rateKgPerWeek))
      : null;
  const suggest = body.weightKg !== null && shouldSuggestRecalculation(entries, body.weightKg);
  // Steps are in the user's unit (0.1 kg or 0.2 lb); the value is kept in kilograms.
  const system = activeUnitSystem();
  const step = weightStep(system);
  const change = (delta: number) =>
    setValue((v) => weightToKg(Math.round((displayWeight(v, system) + delta) * 10) / 10, system));
  const unitLabel = system === 'imperial' ? 'lb' : strings.common.kgUnit;

  const save = () => {
    log(today(), value);
    haptics.success();
    showToast(t.logged);
  };
  const deleteEntry = (date: string) => {
    const removed = remove(date);
    if (removed) showToast(t.deleted, { label: strings.common.undo, onPress: () => restore(removed) });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.title} />
      <ScrollView contentContainerStyle={styles.content}>
        {suggest && trend !== null && body.weightKg !== null ? (
          <Card style={[styles.gap, styles.suggest]}>
            <Text variant="heading">{t.suggestTitle}</Text>
            <Text variant="body" color="textMuted">
              {format(t.suggestBody, { diff: formatBodyWeight(Math.abs(trend - body.weightKg)) })}
            </Text>
            <Button label={t.suggestCta} size="compact" onPress={() => router.push('/calculator')} />
          </Card>
        ) : null}

        <CheckInCard />

        <Card style={styles.gap}>
          <Text variant="overline" color="textSubtle">
            {t.log}
          </Text>
          <View style={styles.logRow}>
            <IconButton icon="minus" size={52} haptic="select" accessibilityLabel={format(t.minus, { step: formatWeightChange(-step).replace('−', '') })} onPress={() => change(-step)} />
            <View style={styles.valueBox} accessible accessibilityLabel={kg(value)}>
              <Text variant="displayLarge" style={styles.tabular}>
                {bare(value)}
              </Text>
              <Text variant="label" color="textSubtle">
                {unitLabel}
              </Text>
            </View>
            <IconButton icon="plus" size={52} haptic="select" accessibilityLabel={format(t.plus, { step: formatWeightChange(step).replace('+', '') })} onPress={() => change(step)} />
          </View>
          <View style={styles.quick}>
            {[-1, -0.5, 0.5, 1].map((delta) => (
              <Button
                key={delta}
                size="compact"
                variant="secondary"
                label={`${delta > 0 ? '+' : '−'}${formatFixed(Math.abs(delta), 1)}`}
                accessibilityLabel={format(delta > 0 ? t.plus : t.minus, { step: `${formatFixed(Math.abs(delta), 1)} ${unitLabel}` })}
                onPress={() => change(delta)}
                haptic="select"
                style={styles.flex}
              />
            ))}
          </View>
          <Button label={t.logToday} onPress={save} haptic="none" />
        </Card>

        {entries.length === 0 ? (
          <EmptyState icon="chart" mascot="idle" title={t.emptyTitle} body={t.emptyBody} />
        ) : (
          <>
            <Card style={styles.gap}>
              <View style={styles.spread}>
                <View>
                  <Text variant="overline" color="textSubtle">
                    {t.trend}
                  </Text>
                  <Text variant="display" style={styles.tabular}>
                    {trend !== null ? kg(trend) : ''}
                  </Text>
                </View>
              </View>
              <WeightChart entries={entries} targetKg={target} />
              <Text variant="caption" color="textSubtle">
                {t.trendHint}
              </Text>
            </Card>

            <Card style={styles.gap}>
              <Text variant="heading" accessibilityRole="header">
                {t.progressTitle}
              </Text>
              {target !== null && goal.startWeightKg !== null && trend !== null ? (
                <>
                  <Text variant="body" color="textMuted">
                    {format(t.progress, { start: kg(goal.startWeightKg), target: kg(target) })}
                  </Text>
                  <ProgressMeter
                    tone="success"
                    value={goalProgress(goal.startWeightKg, trend, target)}
                    accessibilityLabel={t.progressTitle}
                  />
                  <Text variant="label" color="success">
                    {format(t.progressDone, {
                      value: Math.round(goalProgress(goal.startWeightKg, trend, target) * 100),
                    })}
                  </Text>
                  <Text variant="overline" color="textSubtle">
                    {strings.progress2.milestones}
                  </Text>
                  <View style={styles.milestones}>
                    {milestones(goal.startWeightKg, trend, target).map((m) => (
                      <View
                        key={m.share}
                        style={[styles.milestone, m.reached && styles.milestoneReached]}
                        accessible
                        accessibilityLabel={`${format(strings.progress2.milestone, {
                          share: Math.round(m.share * 100),
                          value: kg(m.kg),
                        })}${m.reached ? `, ${strings.progress2.reached}` : ''}`}
                      >
                        <Icon name={m.reached ? 'checkCircle' : 'flag'} size={18} color={m.reached ? 'success' : 'textSubtle'} />
                        <Text variant="caption" color={m.reached ? 'success' : 'textMuted'}>
                          {`${Math.round(m.share * 100)} %`}
                        </Text>
                        <Text variant="label">{bare(m.kg)}</Text>
                      </View>
                    ))}
                  </View>
                  <Text variant="overline" color="textSubtle">
                    {strings.progress2.forecastTitle}
                  </Text>
                  <Text variant="body" color="textMuted">
                    {forecast ? format(strings.progress2.forecast, { date: numericDate(forecast) }) : strings.progress2.noForecast}
                  </Text>
                  {planned ? (
                    <Text variant="caption" color="textSubtle">
                      {format(strings.progress2.planned, { date: numericDate(planned) })}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text variant="body" color="textMuted">
                    {t.noGoal}
                  </Text>
                  <Button label={t.setGoal} size="compact" variant="secondary" onPress={() => router.push('/calculator')} />
                </>
              )}
            </Card>

            <View style={styles.gapSm}>
              <Text variant="overline" color="textSubtle" accessibilityRole="header">
                {t.history}
              </Text>
              <Card padding="flush">
                {[...entries].reverse().map((entry, i, all) => (
                  <View key={entry.date} style={[styles.entry, i < all.length - 1 && styles.divider]}>
                    <Text variant="body" style={styles.flex}>
                      {diaryDayLabel(entry.date)}
                    </Text>
                    <Text variant="bodyStrong" style={styles.tabular}>
                      {kg(entry.kg)}
                    </Text>
                    <IconButton
                      icon="trash"
                      variant="plain"
                      size={40}
                      accessibilityLabel={format(t.removeA11y, { date: diaryDayLabel(entry.date) })}
                      onPress={() => deleteEntry(entry.date)}
                    />
                  </View>
                ))}
              </Card>
            </View>
          </>
        )}
        <View style={styles.note}>
          <Icon name="shield" size={16} color="textSubtle" />
          <Text variant="caption" color="textSubtle" style={styles.flex}>
            {strings.profile.healthNote}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    milestones: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    milestone: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xxs,
      paddingVertical: spacing.sm,
      borderRadius: 14,
      backgroundColor: colors.surfaceRaised,
    },
    milestoneReached: {
      backgroundColor: colors.successSoft,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
    },
    gap: {
      gap: spacing.md,
    },
    gapSm: {
      gap: spacing.sm,
    },
    suggest: {
      borderColor: colors.accent,
    },
    logRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
    },
    valueBox: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
      minWidth: 130,
      justifyContent: 'center',
    },
    quick: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    spread: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tabular: {
      fontVariant: ['tabular-nums'],
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingLeft: spacing.lg,
      paddingRight: spacing.sm,
      minHeight: 52,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    note: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
  }),
);
