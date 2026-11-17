import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, haptics, Icon, Text } from '@/components/ui';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore, type BodyProfile } from '@/data/stores/profile';
import { useWeightStore } from '@/data/stores/weight';
import { sumEntries } from '@/domain/diary';
import { activityInputs } from '@/domain/activity';
import {
  adaptiveExpenditure,
  ageFromBirthYear,
  macroTargets,
  planEnergy,
  tdee,
  type BodyInfo,
} from '@/domain/energy';
import { format, strings } from '@/i18n';
import { formatEnergy, formatWeightChange } from '@/lib/amounts';
import { addDays, today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.checkIn;
const CHECK_IN_DAYS = 7;

export function bodyInfoOf(body: BodyProfile, weightKg: number, now: Date): BodyInfo | null {
  if (!body.sex || !body.birthYear || !body.heightCm) return null;
  return {
    sex: body.sex,
    ageYears: ageFromBirthYear(body.birthYear, now),
    heightCm: body.heightCm,
    weightKg,
    pregnancy: body.pregnancy,
    bodyFatPct: body.bodyFatPct,
    ...activityInputs(body),
  };
}

/**
 * Weekly check-in: once 2–3 weeks of weigh-ins and food are logged, the real
 * expenditure is estimated from the user's own data and a goal update is
 * suggested (never applied automatically). Explained in plain language.
 */
export function CheckInCard() {
  const weights = useWeightStore((s) => s.entries);
  const entries = useDiaryStore((s) => s.entries);
  const body = useProfileStore((s) => s.body);
  const goal = useProfileStore((s) => s.weightGoal);
  const goals = useProfileStore((s) => s.goals);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const update = useProfileStore((s) => s.update);
  const setGoals = useProfileStore((s) => s.setGoals);
  const now = today();

  const result = useMemo(() => {
    const weight = weights.at(-1)?.kg ?? body.weightKg;
    if (!weight) return null;
    const info = bodyInfoOf(body, weight, new Date());
    if (!info) return null;
    const intake: Record<string, number> = {};
    for (const entry of entries) intake[entry.date] = (intake[entry.date] ?? 0) + sumEntries([entry]).kcal;
    const formula = tdee(info);
    const estimate = adaptiveExpenditure(weights, intake, now, formula);
    if (estimate.status !== 'ok') return { info, formula, estimate, suggestion: null };
    const plan = planEnergy(
      info,
      { type: goal.type, rateKgPerWeek: goal.rateKgPerWeek, targetWeightKg: goal.targetWeightKg ?? weight },
      { tdeeOverride: estimate.tdee },
    );
    return { info, formula, estimate, suggestion: plan };
  }, [weights, entries, body, goal, now]);

  if (!hasGoal || !result) return null;
  const recentlyDecided = goal.lastCheckIn !== null && goal.lastCheckIn > addDays(now, -CHECK_IN_DAYS);
  const { estimate, suggestion, info } = result;

  const apply = () => {
    if (!suggestion || estimate.status !== 'ok') return;
    const macros = goal.manualMacros
      ? { ...goals, kcal: suggestion.targetKcal }
      : macroTargets(suggestion.targetKcal, suggestion.goal, info.weightKg, info.heightCm, goal.dietStyle);
    setGoals(macros);
    update({ weightGoal: { ...goal, adaptiveTdee: estimate.tdee, lastCheckIn: now } });
    haptics.success();
    showToast(t.applied);
  };
  const keep = () => update({ weightGoal: { ...goal, lastCheckIn: now } });

  if (estimate.status === 'notEnoughData') {
    return (
      <Card style={styles.card}>
        <Header />
        <Text variant="body" color="textMuted">
          {t.notEnough}
        </Text>
        <Text variant="caption" color="textSubtle">
          {format(t.progress, { span: estimate.spanDays, days: estimate.loggedDays })}
        </Text>
      </Card>
    );
  }

  if (recentlyDecided) {
    return goal.adaptiveTdee !== null ? (
      <Card style={styles.card}>
        <Header />
        <Text variant="body" color="textMuted">
          {format(t.usingAdaptive, { value: formatEnergy(goal.adaptiveTdee) })}
        </Text>
      </Card>
    ) : null;
  }

  if (estimate.status === 'unreliable') {
    return (
      <Card style={styles.card}>
        <Header />
        <Text variant="body" color="textMuted">
          {t.unreliable}
        </Text>
        <Button label={t.gotIt} size="compact" variant="secondary" onPress={keep} />
      </Card>
    );
  }

  return (
    <Card style={[styles.card, styles.highlight]}>
      <Header />
      <Text variant="title" color="accentText">
        {format(t.estimate, { value: formatEnergy(estimate.tdee) })}
      </Text>
      <Text variant="caption" color="textSubtle">
        {format(t.formula, { value: formatEnergy(result.formula) })}
      </Text>
      <Text variant="body" color="textMuted">
        {format(t.trend, {
          value: formatWeightChange(estimate.weeklyChangeKg, undefined, 2),
          intake: formatEnergy(estimate.avgIntake),
        })}
      </Text>
      <Text variant="caption" color="textSubtle">
        {t.explain}
      </Text>
      {suggestion ? (
        <Text variant="bodyStrong">{format(t.suggest, { value: formatEnergy(suggestion.targetKcal) })}</Text>
      ) : null}
      <View style={styles.actions}>
        <Button label={t.apply} size="compact" onPress={apply} haptic="none" />
        <Button label={t.keep} size="compact" variant="ghost" onPress={keep} />
      </View>
    </Card>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Icon name="calendarCheck" size={20} color="accentText" />
      <Text variant="heading">{t.title}</Text>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    card: {
      gap: spacing.sm,
    },
    highlight: {
      borderWidth: 1,
      borderColor: colors.accent,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
  }),
);
