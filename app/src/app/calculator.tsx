import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { WizardFrame } from '@/components/WizardFrame';
import {
  Button,
  Card,
  haptics,
  Icon,
  IconButton,
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
  ageFromBirthYear,
  BODY_FAT_RANGE,
  cycleWeek,
  DIET_STYLES,
  expenditure,
  GAIN_RATE_OPTIONS,
  goalDate,
  KCAL_FLOOR,
  macroTargets,
  minHealthyWeightKg,
  planEnergy,
  RATE_OPTIONS,
  type ActivityLevel,
  type Adjustment,
  type BodyInfo,
  type Cycling,
  type DietStyle,
  type GoalType,
  type PregnancyStatus,
  type Sex,
  type Weekday,
  type Workout,
  type WorkoutType,
} from '@/domain/energy';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.calculator;
const g = strings.goals2;
const STEPS = ['body', 'activity', 'result', 'goal', 'style', 'cycling'] as const;
type Step = (typeof STEPS)[number];
const GOALS: readonly GoalType[] = ['lose', 'maintain', 'gain', 'recomp'];
const WORKOUT_TYPES: readonly WorkoutType[] = ['walk', 'run', 'cycle', 'gym', 'swim', 'ball', 'yoga', 'other'];

const decimal = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 2 });
const kg = (value: number) => format(t.weightValue, { value: decimal.format(value) });

function finnishDate(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

/**
 * Calorie need and goal. BMR from Mifflin–St Jeor (or Katch–McArdle with a
 * known body fat %), everyday activity from the type of work or steps, plus
 * workouts by type; then a goal (lose, maintain, muscle gain, recomposition)
 * with the mandatory safety limits in domain/energy.ts, an eating style that
 * presets macros, and optional calorie cycling. Part of onboarding
 * (skippable) and available from the profile. Every choice explains itself.
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
  const saved = profile.body;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sex, setSex] = useState<Sex | null>(saved.sex);
  const [age, setAge] = useState(saved.birthYear ? ageFromBirthYear(saved.birthYear, now) : 35);
  const [height, setHeight] = useState(saved.heightCm ?? 170);
  const [weight, setWeight] = useState(latestWeight ?? saved.weightKg ?? 75);
  const [pregnancy, setPregnancy] = useState<PregnancyStatus>(saved.pregnancy);
  const [bodyFat, setBodyFat] = useState<number | null>(saved.bodyFatPct);
  const [everydayMode, setEverydayMode] = useState(saved.everydayMode);
  const [activity, setActivity] = useState<ActivityLevel>(saved.activity);
  const [steps, setSteps] = useState(saved.steps);
  const [workouts, setWorkouts] = useState<Workout[]>(() =>
    saved.workouts.length > 0
      ? saved.workouts
      : saved.exercisePerWeek > 0
        ? [{ type: 'other', perWeek: saved.exercisePerWeek, minutes: 45 }]
        : [],
  );
  const [goalType, setGoalType] = useState<GoalType>(profile.weightGoal.type);
  const [rate, setRate] = useState(profile.weightGoal.rateKgPerWeek);
  const [target, setTarget] = useState(profile.weightGoal.targetWeightKg ?? weight - 5);
  const [style, setStyle] = useState<DietStyle>(profile.weightGoal.dietStyle);
  const [manualMacros, setManualMacros] = useState(profile.weightGoal.manualMacros);
  const [manual, setManual] = useState<Macros>(profile.goals);
  const [cycling, setCycling] = useState<Cycling>(profile.weightGoal.cycling);

  const step: Step = STEPS[index];
  const body: BodyInfo = {
    sex: sex ?? 'female',
    ageYears: age,
    heightCm: height,
    weightKg: weight,
    activity,
    exercisePerWeek: 0,
    pregnancy: sex === 'female' ? pregnancy : 'none',
    bodyFatPct: bodyFat,
    steps: everydayMode === 'steps' ? steps : null,
    workouts,
  };
  const spend = expenditure(body);
  const plan = planEnergy(body, { type: goalType, rateKgPerWeek: rate, targetWeightKg: target });
  const autoMacros = macroTargets(plan.targetKcal, plan.goal, weight, height, style);
  const macros = manualMacros ? { ...manual, kcal: plan.targetKcal } : autoMacros;
  const floor = KCAL_FLOOR[body.sex];
  const week = cycleWeek(plan.targetKcal, cycling, floor);

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
    if (type === 'lose') {
      setTarget(Math.max(minTarget, Math.round((weight - 5) * 2) / 2));
      if (!RATE_OPTIONS.includes(rate as (typeof RATE_OPTIONS)[number])) setRate(0.5);
    }
    if (type === 'gain') {
      setTarget(Math.round((weight + 4) * 2) / 2);
      if (!GAIN_RATE_OPTIONS.includes(rate as (typeof GAIN_RATE_OPTIONS)[number])) setRate(0.25);
    }
    if (type === 'recomp' && style === 'balanced') setStyle('highProtein');
  };

  const updateWorkout = (i: number, patch: Partial<Workout>) =>
    setWorkouts((list) => list.map((w, j) => (j === i ? { ...w, ...patch } : w)));

  const save = () => {
    update({
      body: {
        sex,
        birthYear: now.getFullYear() - age,
        heightCm: height,
        weightKg: weight,
        activity,
        exercisePerWeek: 0,
        pregnancy: body.pregnancy,
        bodyFatPct: bodyFat,
        everydayMode,
        steps,
        workouts,
      },
      weightGoal: {
        type: plan.goal,
        rateKgPerWeek: rate,
        targetWeightKg: plan.goal === 'lose' || plan.goal === 'gain' ? plan.targetWeightKg : null,
        startWeightKg: weight,
        setAt: now.toISOString(),
        manualMacros,
        dietStyle: style,
        cycling,
        // A new calculation starts from the formula; the weekly check-in refines it again.
        adaptiveTdee: null,
        lastCheckIn: profile.weightGoal.lastCheckIn,
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
    format(t.adjustments[code], { min: decimal.format(minTarget), floor: formatInteger(floor) });

  const rateOptions: readonly number[] = goalType === 'gain' ? GAIN_RATE_OPTIONS : RATE_OPTIONS;

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
              <Stepper value={age} min={13} max={100} onChange={setAge} format={(v) => format(t.ageValue, { value: v })} accessibilityLabel={t.age} />
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
              <Stepper value={weight} min={35} max={250} step={0.5} onChange={setWeight} format={kg} accessibilityLabel={t.weight} />
            </NumberRow>
          </Card>
          <Card style={styles.gapSm}>
            <SwitchRow
              label={g.bodyFatOn}
              hint={g.bodyFatHint}
              value={bodyFat !== null}
              onValueChange={(on) => setBodyFat(on ? (sex === 'male' ? 20 : 30) : null)}
            />
            {bodyFat !== null ? (
              <NumberRow label={g.bodyFat}>
                <Stepper
                  value={bodyFat}
                  min={BODY_FAT_RANGE.min}
                  max={BODY_FAT_RANGE.max}
                  onChange={setBodyFat}
                  format={(v) => format(g.bodyFatValue, { value: v })}
                  accessibilityLabel={g.bodyFat}
                />
              </NumberRow>
            ) : null}
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
      title: g.everydayTitle,
      body: g.everydayBody,
      node: (
        <View style={styles.gap}>
          <View style={styles.chips} accessibilityRole="radiogroup">
            <SelectChip role="radio" label={g.modeJob} selected={everydayMode === 'job'} onPress={() => setEverydayMode('job')} />
            <SelectChip role="radio" label={g.modeSteps} selected={everydayMode === 'steps'} onPress={() => setEverydayMode('steps')} />
          </View>
          {everydayMode === 'job' ? (
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
          ) : (
            <Card style={styles.gapSm}>
              <View style={styles.spread}>
                <Text variant="bodyStrong">{g.steps}</Text>
                <Text variant="heading" color="accentText" style={styles.tabular}>
                  {format(g.stepsValue, { value: formatInteger(steps) })}
                </Text>
              </View>
              <Slider
                value={steps}
                min={1000}
                max={25000}
                step={500}
                onChange={setSteps}
                accessibilityLabel={g.steps}
                accessibilityValueText={format(g.stepsValue, { value: formatInteger(steps) })}
              />
              <Text variant="caption" color="textSubtle">
                {g.stepsHint}
              </Text>
            </Card>
          )}

          <View style={styles.gapSm}>
            <Text variant="overline" color="textSubtle" accessibilityRole="header">
              {g.workoutsTitle}
            </Text>
            <Text variant="caption" color="textSubtle">
              {g.workoutsBody}
            </Text>
            {workouts.length === 0 ? (
              <Text variant="body" color="textMuted">
                {g.noWorkouts}
              </Text>
            ) : (
              workouts.map((workout, i) => (
                <Card key={`${workout.type}-${i}`} style={styles.gapSm}>
                  <View style={styles.noteHeader}>
                    <Icon name="dumbbell" size={20} color="accentText" />
                    <Text variant="bodyStrong" style={styles.flex}>
                      {g.workoutTypes[workout.type]}
                    </Text>
                    <IconButton
                      icon="close"
                      variant="plain"
                      size={40}
                      accessibilityLabel={format(g.removeWorkout, { type: g.workoutTypes[workout.type] })}
                      onPress={() => setWorkouts((list) => list.filter((_, j) => j !== i))}
                    />
                  </View>
                  <NumberRow label={g.workoutPerWeek}>
                    <Stepper value={workout.perWeek} min={1} max={14} onChange={(perWeek) => updateWorkout(i, { perWeek })} accessibilityLabel={g.workoutPerWeek} />
                  </NumberRow>
                  <NumberRow label={g.workoutMinutes}>
                    <Stepper
                      value={workout.minutes}
                      min={10}
                      max={240}
                      step={5}
                      onChange={(minutes) => updateWorkout(i, { minutes })}
                      format={(v) => format(g.minutesValue, { value: v })}
                      accessibilityLabel={g.workoutMinutes}
                    />
                  </NumberRow>
                </Card>
              ))
            )}
            <Text variant="label" color="textMuted">
              {g.addWorkout}
            </Text>
            <View style={styles.chips}>
              {WORKOUT_TYPES.filter((type) => !workouts.some((w) => w.type === type)).map((type) => (
                <SelectChip
                  key={type}
                  icon="plus"
                  label={g.workoutTypes[type]}
                  selected={false}
                  onPress={() => setWorkouts((list) => [...list, { type, perWeek: 2, minutes: 45 }])}
                />
              ))}
            </View>
          </View>
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
              {format(t.kcalPerDay, { value: formatInteger(spend.bmr) })}
            </Text>
            <Text variant="body" color="textMuted">
              {t.bmrExplain}
            </Text>
            <Text variant="caption" color="textSubtle">
              {spend.formula === 'katch' ? g.formulaKatch : g.formulaMifflin}
            </Text>
          </Card>
          <Card style={styles.gapSm}>
            <View style={styles.spread}>
              <Text variant="body" color="textMuted">
                {g.everyday}
              </Text>
              <Text variant="bodyStrong">{format(g.everydayValue, { factor: decimal.format(spend.everydayFactor) })}</Text>
            </View>
            <View style={styles.spread}>
              <Text variant="body" color="textMuted">
                {g.exercise}
              </Text>
              <Text variant="bodyStrong">{format(g.exerciseValue, { value: formatInteger(spend.exerciseKcal) })}</Text>
            </View>
          </Card>
          <Card style={[styles.gapSm, styles.highlight]}>
            <Text variant="overline" color="accentText">
              {t.tdee}
            </Text>
            <Text variant="display" color="accentText" style={styles.tabular}>
              {format(t.kcalPerDay, { value: formatInteger(spend.tdee) })}
            </Text>
            <Text variant="body" color="textMuted">
              {format(t.tdeeExplain, { factor: decimal.format(spend.tdee / spend.bmr) })}
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
            {GOALS.map((type) => (
              <OptionRow
                key={type}
                title={g.goalHints[type].title}
                hint={`${g.goalHints[type].what} ${g.goalHints[type].who}`}
                selected={goalType === type}
                onPress={() => chooseGoal(type)}
              />
            ))}
          </View>

          {goalType === 'lose' || goalType === 'gain' ? (
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
                  {rateOptions.map((option) => (
                    <SelectChip
                      key={option}
                      role="radio"
                      label={format(t.rateValue, { value: decimal.format(option) })}
                      selected={rate === option}
                      onPress={() => setRate(option)}
                    />
                  ))}
                </View>
                {goalType === 'gain' ? (
                  <Text variant="caption" color="textSubtle">
                    {g.gainRateHint}
                  </Text>
                ) : null}
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
              {plan.goal === 'recomp'
                ? g.recompNote
                : plan.goal === 'maintain' || plan.weeksToGoal === null
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
    style: {
      title: g.styleTitle,
      body: g.styleBody,
      node: (
        <View style={styles.gap}>
          <View style={styles.gapSm} accessibilityRole="radiogroup">
            {DIET_STYLES.map((value) => (
              <OptionRow
                key={value}
                title={g.styles[value].title}
                hint={`${g.styles[value].what} ${g.styles[value].who}`}
                selected={style === value}
                onPress={() => {
                  setStyle(value);
                  setManualMacros(false);
                }}
              />
            ))}
          </View>
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
                key === 'proteinG' ? strings.profileEdit.protein : key === 'carbsG' ? strings.profileEdit.carbs : strings.profileEdit.fat;
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
              {format(t.macroSum, { value: formatInteger(macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9) })}
            </Text>
          </Card>
        </View>
      ),
    },
    cycling: {
      title: g.cyclingTitle,
      body: g.cyclingHint,
      node: (
        <View style={styles.gap}>
          <Card padding="flush">
            <View style={styles.switchPad}>
              <SwitchRow
                label={g.cyclingSwitch}
                value={cycling.enabled}
                onValueChange={(enabled) => setCycling((c) => ({ ...c, enabled }))}
              />
            </View>
          </Card>
          {cycling.enabled ? (
            <>
              <View style={styles.gapSm}>
                <Text variant="overline" color="textSubtle">
                  {g.cyclingDays}
                </Text>
                <View style={styles.chips}>
                  {g.weekdaysShort.map((label, day) => {
                    const selected = cycling.highDays.includes(day as Weekday);
                    return (
                      <SelectChip
                        key={label}
                        label={label}
                        selected={selected}
                        onPress={() =>
                          setCycling((c) => ({
                            ...c,
                            highDays: selected
                              ? c.highDays.filter((d) => d !== day)
                              : ([...c.highDays, day].sort() as Weekday[]),
                          }))
                        }
                      />
                    );
                  })}
                </View>
              </View>
              <Card style={styles.gapSm}>
                <View style={styles.spread}>
                  <Text variant="bodyStrong">{g.cyclingExtra}</Text>
                  <Text variant="heading" color="accentText">
                    {format(g.cyclingExtraValue, { value: cycling.extraKcal })}
                  </Text>
                </View>
                <Slider
                  value={cycling.extraKcal}
                  min={100}
                  max={700}
                  step={50}
                  onChange={(extraKcal) => setCycling((c) => ({ ...c, extraKcal }))}
                  accessibilityLabel={g.cyclingExtra}
                  accessibilityValueText={format(g.cyclingExtraValue, { value: cycling.extraKcal })}
                />
              </Card>
              <Card style={styles.gapSm}>
                <View style={styles.weekRow}>
                  {week.perDay.map((kcal, day) => {
                    const high = cycling.highDays.includes(day as Weekday);
                    return (
                      <View key={day} style={styles.weekDay} accessible accessibilityLabel={`${g.weekdaysShort[day]} ${kcal} kcal`}>
                        <Text variant="caption" color="textSubtle">
                          {g.weekdaysShort[day]}
                        </Text>
                        <Text variant="label" color={high ? 'accentText' : 'text'} style={styles.tabular}>
                          {formatInteger(kcal)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text variant="caption" color="textSubtle">
                  {format(g.weekBudget, { value: formatInteger(plan.targetKcal * 7) })}
                </Text>
                {week.limited ? (
                  <Text variant="caption" color="textMuted">
                    {format(g.cyclingLimited, { floor: formatInteger(floor) })}
                  </Text>
                ) : null}
              </Card>
            </>
          ) : null}
        </View>
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

const styles = themedStyles(() =>
  StyleSheet.create({
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
    switchPad: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    weekDay: {
      alignItems: 'center',
      gap: spacing.xxs,
      flex: 1,
    },
  }),
);
