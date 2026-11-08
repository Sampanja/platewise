import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { WizardFrame } from '@/components/WizardFrame';
import {
  Button,
  Card,
  haptics,
  Icon,
  OptionRow,
  SelectChip,
  Slider,
  Stepper,
  SwitchRow,
  Text,
} from '@/components/ui';
import { useProfileStore } from '@/data/stores/profile';
import { useWeightStore } from '@/data/stores/weight';
import type { Macros } from '@/data/types';
import {
  activityFactor,
  ageFromBirthYear,
  goalDate,
  KCAL_FLOOR,
  macroTargets,
  minHealthyWeightKg,
  planEnergy,
  RATE_OPTIONS,
  type ActivityLevel,
  type Adjustment,
  type BodyInfo,
  type GoalType,
  type PregnancyStatus,
  type Sex,
} from '@/domain/energy';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing } from '@/theme';

const t = strings.calculator;
const STEPS = ['body', 'activity', 'result', 'goal', 'macros'] as const;
type Step = (typeof STEPS)[number];

const decimal = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 2 });
const kg = (value: number) => format(t.weightValue, { value: decimal.format(value) });

function finnishDate(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

/**
 * Calorie need and weight goal: Mifflin–St Jeor BMR × activity = TDEE, then a
 * goal with mandatory safety limits (domain/energy.ts). Part of onboarding
 * (skippable) and available from the profile.
 */
export default function CalculatorScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const profile = useProfileStore.getState();
  const update = useProfileStore((s) => s.update);
  const setGoals = useProfileStore((s) => s.setGoals);
  const logWeight = useWeightStore((s) => s.log);
  const latestWeight = useWeightStore((s) => s.entries.at(-1)?.kg);
  const now = new Date();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sex, setSex] = useState<Sex | null>(profile.body.sex);
  const [age, setAge] = useState(profile.body.birthYear ? ageFromBirthYear(profile.body.birthYear, now) : 35);
  const [height, setHeight] = useState(profile.body.heightCm ?? 170);
  const [weight, setWeight] = useState(latestWeight ?? profile.body.weightKg ?? 75);
  const [pregnancy, setPregnancy] = useState<PregnancyStatus>(profile.body.pregnancy);
  const [activity, setActivity] = useState<ActivityLevel>(profile.body.activity);
  const [exercise, setExercise] = useState(profile.body.exercisePerWeek);
  const [goalType, setGoalType] = useState<GoalType>(profile.weightGoal.type);
  const [rate, setRate] = useState(profile.weightGoal.rateKgPerWeek);
  const [target, setTarget] = useState(profile.weightGoal.targetWeightKg ?? weight - 5);
  const [manualMacros, setManualMacros] = useState(profile.weightGoal.manualMacros);
  const [manual, setManual] = useState<Macros>(profile.goals);

  const step: Step = STEPS[index];
  const body: BodyInfo = {
    sex: sex ?? 'female',
    ageYears: age,
    heightCm: height,
    weightKg: weight,
    activity,
    exercisePerWeek: exercise,
    pregnancy: sex === 'female' ? pregnancy : 'none',
  };
  const plan = planEnergy(body, { type: goalType, rateKgPerWeek: rate, targetWeightKg: target });
  const autoMacros = macroTargets(plan.targetKcal, plan.goal, weight, height);
  const macros = manualMacros ? { ...manual, kcal: plan.targetKcal } : autoMacros;

  const minTarget = minHealthyWeightKg(height);
  const goTo = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };
  const close = () => {
    if (fromOnboarding) {
      update({ onboardingCompleted: true });
      router.replace('/');
    } else {
      router.back();
    }
  };
  const chooseGoal = (type: GoalType) => {
    setGoalType(type);
    if (type === 'lose') setTarget(Math.max(minTarget, Math.round((weight - 5) * 2) / 2));
    if (type === 'gain') {
      setTarget(Math.round((weight + 4) * 2) / 2);
      if (rate > 0.5) setRate(0.5);
    }
  };

  const save = () => {
    update({
      body: {
        sex,
        birthYear: now.getFullYear() - age,
        heightCm: height,
        weightKg: weight,
        activity,
        exercisePerWeek: exercise,
        pregnancy: body.pregnancy,
      },
      weightGoal: {
        type: plan.goal,
        rateKgPerWeek: rate,
        targetWeightKg: plan.goal === 'maintain' ? null : plan.targetWeightKg,
        startWeightKg: weight,
        setAt: now.toISOString(),
        manualMacros,
      },
      hasCalorieGoal: true,
      ...(fromOnboarding ? { onboardingCompleted: true } : null),
    });
    setGoals(macros);
    logWeight(today(), weight);
    haptics.success();
    showToast(t.saved);
    if (fromOnboarding) router.replace('/');
    else router.back();
  };

  const adjustmentText = (code: Adjustment) =>
    format(t.adjustments[code], { min: decimal.format(minTarget), floor: formatInteger(KCAL_FLOOR[body.sex]) });

  const content: Record<Step, { title: string; body?: string; node: ReactNode }> = {
    body: {
      title: t.bodyTitle,
      body: t.bodyBody,
      node: (
        <View style={styles.gap}>
          <View style={styles.gapSm}>
            <Text variant="overline" color="textSubtle" accessibilityRole="header">
              {t.sexLabel}
            </Text>
            <View style={styles.row}>
              {(['female', 'male'] as const).map((value) => (
                <View key={value} style={styles.flex}>
                  <OptionRow
                    title={value === 'female' ? t.female : t.male}
                    selected={sex === value}
                    onPress={() => setSex(value)}
                  />
                </View>
              ))}
            </View>
            <Text variant="caption" color="textSubtle">
              {t.sexHint}
            </Text>
          </View>
          <Card style={styles.gap}>
            <NumberRow label={t.age}>
              <Stepper
                value={age}
                min={13}
                max={100}
                onChange={setAge}
                format={(v) => format(t.ageValue, { value: v })}
                accessibilityLabel={t.age}
              />
            </NumberRow>
            <NumberRow label={t.height}>
              <Stepper
                value={height}
                min={120}
                max={220}
                onChange={setHeight}
                format={(v) => format(t.heightValue, { value: v })}
                accessibilityLabel={t.height}
              />
            </NumberRow>
            <NumberRow label={t.weight}>
              <Stepper
                value={weight}
                min={35}
                max={250}
                step={0.5}
                onChange={setWeight}
                format={kg}
                accessibilityLabel={t.weight}
              />
            </NumberRow>
          </Card>
          {sex === 'female' ? (
            <View style={styles.gapSm}>
              <Text variant="overline" color="textSubtle" accessibilityRole="header">
                {t.pregnancyLabel}
              </Text>
              <View style={styles.chips}>
                {(['none', 'pregnant', 'breastfeeding'] as const).map((value) => (
                  <SelectChip
                    key={value}
                    role="radio"
                    label={value === 'none' ? t.pregnancyNone : value === 'pregnant' ? t.pregnant : t.breastfeeding}
                    selected={pregnancy === value}
                    onPress={() => setPregnancy(value)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ),
    },
    activity: {
      title: t.activityTitle,
      body: t.activityBody,
      node: (
        <View style={styles.gap}>
          <View style={styles.gapSm} accessibilityRole="radiogroup">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <OptionRow
                key={level}
                title={t[`activity${level}`]}
                hint={t[`activity${level}Hint`]}
                selected={activity === level}
                onPress={() => setActivity(level)}
              />
            ))}
          </View>
          <Card style={styles.gapSm}>
            <NumberRow label={t.exercise} hint={t.exerciseHint}>
              <Stepper
                value={exercise}
                min={0}
                max={14}
                onChange={setExercise}
                accessibilityLabel={t.exercise}
              />
            </NumberRow>
          </Card>
        </View>
      ),
    },
    result: {
      title: t.resultTitle,
      body: t.resultBody,
      node: (
        <View style={styles.gap}>
          <Card style={styles.gapSm}>
            <Text variant="overline" color="textSubtle">
              {t.bmr}
            </Text>
            <Text variant="display" style={styles.tabular}>
              {format(t.kcalPerDay, { value: formatInteger(plan.bmr) })}
            </Text>
            <Text variant="body" color="textMuted">
              {t.bmrExplain}
            </Text>
          </Card>
          <Card style={[styles.gapSm, styles.highlight]}>
            <Text variant="overline" color="accentText">
              {t.tdee}
            </Text>
            <Text variant="display" color="accentText" style={styles.tabular}>
              {format(t.kcalPerDay, { value: formatInteger(plan.tdee) })}
            </Text>
            <Text variant="body" color="textMuted">
              {format(t.tdeeExplain, {
                factor: decimal.format(activityFactor(activity, exercise)),
              })}
            </Text>
          </Card>
        </View>
      ),
    },
    goal: {
      title: t.goalTitle,
      body: t.goalBody,
      node: (
        <View style={styles.gap}>
          <View style={styles.gapSm} accessibilityRole="radiogroup">
            <OptionRow title={t.lose} hint={t.loseHint} selected={goalType === 'lose'} onPress={() => chooseGoal('lose')} />
            <OptionRow
              title={t.maintain}
              hint={t.maintainHint}
              selected={goalType === 'maintain'}
              onPress={() => chooseGoal('maintain')}
            />
            <OptionRow title={t.gain} hint={t.gainHint} selected={goalType === 'gain'} onPress={() => chooseGoal('gain')} />
          </View>

          {goalType !== 'maintain' ? (
            <Card style={styles.gap}>
              <View style={styles.gapSm}>
                <View style={styles.spread}>
                  <Text variant="bodyStrong">{t.targetWeight}</Text>
                  <Text variant="heading" color="accentText" style={styles.tabular}>
                    {kg(target)}
                  </Text>
                </View>
                <Slider
                  value={target * 2}
                  min={(goalType === 'lose' ? Math.min(minTarget, weight - 0.5) : weight + 0.5) * 2}
                  max={(goalType === 'lose' ? weight - 0.5 : weight + 25) * 2}
                  step={1}
                  onChange={(v) => setTarget(v / 2)}
                  accessibilityLabel={t.targetWeight}
                  accessibilityValueText={kg(target)}
                />
                {goalType === 'lose' ? (
                  <Text variant="caption" color="textSubtle">
                    {format(t.minTargetHint, { min: kg(minTarget) })}
                  </Text>
                ) : null}
              </View>
              <View style={styles.gapSm}>
                <Text variant="bodyStrong">{t.rate}</Text>
                <View style={styles.chips} accessibilityRole="radiogroup">
                  {RATE_OPTIONS.filter((r) => goalType === 'lose' || r <= 0.5).map((option) => (
                    <SelectChip
                      key={option}
                      role="radio"
                      label={format(t.rateValue, { value: decimal.format(option) })}
                      selected={rate === option}
                      onPress={() => setRate(option)}
                    />
                  ))}
                </View>
              </View>
            </Card>
          ) : null}

          <Card style={[styles.gapSm, styles.highlight]}>
            <Text variant="overline" color="accentText">
              {t.dailyKcal}
            </Text>
            <Text variant="displayLarge" color="accentText" style={styles.tabular}>
              {format(strings.common.kcal, { value: formatInteger(plan.targetKcal) })}
            </Text>
            <Text variant="body" color="textMuted">
              {plan.goal === 'maintain' || plan.weeksToGoal === null
                ? t.maintainNote
                : format(t.eta, { date: finnishDate(goalDate(now, plan.weeksToGoal)), weeks: plan.weeksToGoal })}
            </Text>
          </Card>

          {plan.adjustments.length > 0 ? (
            <Card style={styles.gapSm}>
              <View style={styles.noteHeader}>
                <Icon name="shield" size={20} color="accentText" />
                <Text variant="bodyStrong">{t.noteTitle}</Text>
              </View>
              {plan.adjustments.map((code) => (
                <Text key={code} variant="body" color="textMuted">
                  {adjustmentText(code)}
                </Text>
              ))}
            </Card>
          ) : null}
        </View>
      ),
    },
    macros: {
      title: t.macrosTitle,
      body: t.macrosBody,
      node: (
        <Card style={styles.gap}>
          <View style={styles.spread}>
            <Text variant="bodyStrong">{strings.profileEdit.kcal}</Text>
            <Text variant="heading" color="accentText" style={styles.tabular}>
              {format(strings.common.kcal, { value: formatInteger(plan.targetKcal) })}
            </Text>
          </View>
          <SwitchRow
            label={t.manualMacros}
            value={manualMacros}
            onValueChange={(value) => {
              setManualMacros(value);
              if (value) setManual(autoMacros);
            }}
          />
          {(['proteinG', 'carbsG', 'fatG'] as const).map((key) => {
            const label =
              key === 'proteinG'
                ? strings.profileEdit.protein
                : key === 'carbsG'
                  ? strings.profileEdit.carbs
                  : strings.profileEdit.fat;
            return (
              <NumberRow key={key} label={label}>
                {manualMacros ? (
                  <Stepper
                    value={manual[key]}
                    min={10}
                    max={500}
                    step={5}
                    onChange={(value) => setManual((m) => ({ ...m, [key]: value }))}
                    accessibilityLabel={label}
                  />
                ) : (
                  <Text variant="heading" style={styles.tabular}>
                    {format(strings.common.grams, { value: autoMacros[key] })}
                  </Text>
                )}
              </NumberRow>
            );
          })}
          <Text variant="caption" color="textSubtle">
            {format(t.macroSum, {
              value: formatInteger(macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9),
            })}
          </Text>
        </Card>
      ),
    },
  };

  const current = content[step];
  const isLast = index === STEPS.length - 1;

  return (
    <WizardFrame
      step={index + 1}
      total={STEPS.length}
      stepKey={step}
      direction={direction}
      title={current.title}
      body={current.body}
      onBack={index > 0 ? () => goTo(index - 1) : undefined}
      onClose={fromOnboarding ? undefined : close}
      onSkip={fromOnboarding ? close : undefined}
      footer={
        <Button
          label={isLast ? t.save : strings.common.next}
          onPress={isLast ? save : () => goTo(index + 1)}
          disabled={step === 'body' && sex === null}
          haptic={isLast ? 'none' : 'tap'}
        />
      }
    >
      {current.node}
    </WizardFrame>
  );
}

function NumberRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.numberRow}>
      <View style={styles.flex}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textSubtle">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: spacing.lg,
  },
  gapSm: {
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  highlight: {
    borderColor: colors.accent,
    borderRadius: radii.card,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
