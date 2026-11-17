import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { WizardFrame } from '@/components/WizardFrame';
import {
  EverydayStep,
  ExpenditureSummary,
  WorkoutsStep,
  WorkStep,
  type EverydayAnswer,
  type WorkAnswer,
  type WorkoutsAnswer,
} from '@/features/calculator/ActivitySteps';
import { activityInputs, DEFAULT_ACTIVITY_LEVEL, type ActivityAnswers } from '@/domain/activity';
import {
  scaleMacros,
  suggestedProteinLevel,
  type DietStyle,
  type MacroInput,
  type MacroKey,
  type MealPlan,
  type ProteinLevel,
} from '@/domain/macros';
import { isOccupationId } from '@/domain/occupations';
import { MealsStep, StyleStep } from '@/features/calculator/MacroSteps';
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
  UnitToggle,
} from '@/components/ui';
import { useProfileStore } from '@/data/stores/profile';
import { useWeightStore } from '@/data/stores/weight';
import type { Macros } from '@/data/types';
import {
  ageFromBirthYear,
  BODY_FAT_RANGE,
  cycleWeek,
  expenditure,
  GAIN_RATE_OPTIONS,
  goalDate,
  KCAL_FLOOR,
  macroTargets,
  minHealthyWeightKg,
  planEnergy,
  RATE_OPTIONS,
  type Adjustment,
  type BodyInfo,
  type Cycling,
  type GoalType,
  type PregnancyStatus,
  type Sex,
  type Weekday,
} from '@/domain/energy';
import { CM_PER_INCH, KG_PER_POUND, type HeightUnit, type WeightUnit } from '@/domain/units';
import { format, formatInteger, strings } from '@/i18n';
import { activeUnits } from '@/i18n/locale';
import {
  formatBodyWeight,
  formatEnergy,
  formatEnergyBare,
  formatHeight,
  formatWeightRange,
  heightToggleOptions,
  weightToggleOptions,
} from '@/lib/amounts';
import { numericDate, today, weekdayOrder } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.calculator;
const g = strings.goals2;
const a = strings.activity;
const m = strings.macroPlan;
const STEPS = ['body', 'work', 'everyday', 'workouts', 'result', 'goal', 'style', 'meals', 'cycling'] as const;
type Step = (typeof STEPS)[number];
const GOALS: readonly GoalType[] = ['lose', 'maintain', 'gain', 'recomp'];

const kg = (value: number) => formatBodyWeight(value);

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
  // One-off units for typing height and weight; the setting itself stays.
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(activeUnits().height);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(activeUnits().weight);
  const [weight, setWeight] = useState(latestWeight ?? saved.weightKg ?? 75);
  const [pregnancy, setPregnancy] = useState<PregnancyStatus>(saved.pregnancy);
  const [bodyFat, setBodyFat] = useState<number | null>(saved.bodyFatPct);
  // The three activity questions (domain/activity.ts).
  const [work, setWork] = useState<WorkAnswer>({
    level: saved.activity,
    occupation: isOccupationId(saved.occupation) ? saved.occupation : null,
    situation: saved.situation,
    skipped: saved.skipped.work,
  });
  const [everyday, setEveryday] = useState<EverydayAnswer>({
    commute: saved.commute,
    stepBand: saved.stepBand,
    leisure: saved.leisure,
    skipped: saved.skipped.everyday,
  });
  const [training, setTraining] = useState<WorkoutsAnswer>({ workouts: saved.workouts, skipped: saved.skipped.workouts });
  const [goalType, setGoalType] = useState<GoalType>(profile.weightGoal.type);
  const [rate, setRate] = useState(profile.weightGoal.rateKgPerWeek);
  const [target, setTarget] = useState(profile.weightGoal.targetWeightKg ?? weight - 5);
  const [style, setStyle] = useState<DietStyle>(profile.weightGoal.dietStyle);
  const [proteinLevel, setProteinLevel] = useState<ProteinLevel | null>(profile.weightGoal.proteinLevel);
  // Hand-set macros (custom style), kept as grams for the energy they were set at.
  const [manual, setManual] = useState<Macros>(profile.goals);
  const [macroInput, setMacroInput] = useState<MacroInput>(profile.weightGoal.macroInput);
  const [lockedMacros, setLockedMacros] = useState<MacroKey[]>(profile.weightGoal.lockedMacros);
  const [mealPlan, setMealPlan] = useState<MealPlan>(profile.weightGoal.mealPlan);
  const [cycling, setCycling] = useState<Cycling>(profile.weightGoal.cycling);

  const step: Step = STEPS[index];
  const answers: ActivityAnswers = {
    activity: work.level,
    occupation: work.occupation,
    situation: work.situation,
    commute: everyday.commute,
    stepBand: everyday.stepBand,
    leisure: everyday.leisure,
    workouts: training.workouts,
    skipped: { work: work.skipped, everyday: everyday.skipped, workouts: training.skipped },
  };
  const body: BodyInfo = {
    sex: sex ?? 'female',
    ageYears: age,
    heightCm: height,
    weightKg: weight,
    pregnancy: sex === 'female' ? pregnancy : 'none',
    bodyFatPct: bodyFat,
    ...activityInputs(answers),
  };
  const spend = expenditure(body);
  const plan = planEnergy(body, { type: goalType, rateKgPerWeek: rate, targetWeightKg: target });
  const suggestedLevel = suggestedProteinLevel(plan.goal, style);
  const autoMacros = macroTargets(plan.targetKcal, plan.goal, weight, height, style, proteinLevel);
  // Hand-set macros follow a changed calorie target with the same shares.
  const macros = style === 'custom' ? scaleMacros(manual, plan.targetKcal) : autoMacros;
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
  };

  // What the summary says about skipped questions (and the default used).
  const skippedNotes = [
    work.skipped ? format(a.skipUses, { level: a.levels[DEFAULT_ACTIVITY_LEVEL].title }) : null,
    everyday.skipped ? a.everydaySkipUses : null,
    training.skipped ? a.workoutsSkipUses : null,
  ].filter((note): note is string => note !== null);

  const save = () => {
    update({
      body: {
        sex,
        birthYear: now.getFullYear() - age,
        heightCm: height,
        weightKg: weight,
        pregnancy: body.pregnancy,
        bodyFatPct: bodyFat,
        ...answers,
      },
      weightGoal: {
        type: plan.goal,
        rateKgPerWeek: rate,
        targetWeightKg: plan.goal === 'lose' || plan.goal === 'gain' ? plan.targetWeightKg : null,
        startWeightKg: weight,
        setAt: now.toISOString(),
        manualMacros: style === 'custom',
        dietStyle: style,
        proteinLevel,
        macroInput,
        lockedMacros,
        mealPlan,
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
    format(t.adjustments[code], { min: kg(minTarget), floor: formatInteger(floor) });

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
            <NumberRow
              label={t.height}
              toggle={<UnitToggle value={heightUnit} options={heightToggleOptions()} onChange={setHeightUnit} />}
            >
              <Stepper
                value={height}
                min={120}
                max={220}
                onChange={setHeight}
                step={heightUnit === 'ftin' ? CM_PER_INCH : 1}
                format={(v) => formatHeight(v, heightUnit)}
                accessibilityLabel={t.height}
              />
            </NumberRow>
            <NumberRow
              label={t.weight}
              toggle={<UnitToggle value={weightUnit} options={weightToggleOptions()} onChange={setWeightUnit} />}
            >
              <Stepper
                value={weight}
                min={35}
                max={250}
                step={weightUnit === 'kg' ? 0.5 : KG_PER_POUND}
                onChange={setWeight}
                format={(v) => formatBodyWeight(v, weightUnit)}
                accessibilityLabel={t.weight}
              />
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
    work: {
      title: a.workTitle,
      body: a.workBody,
      node: <WorkStep value={work} onChange={setWork} />,
    },
    everyday: {
      title: a.everydayTitle,
      body: a.everydayBody,
      node: <EverydayStep value={everyday} onChange={setEveryday} />,
    },
    workouts: {
      title: a.workoutsTitle,
      body: a.workoutsBody,
      node: <WorkoutsStep value={training} onChange={setTraining} />,
    },
    result: {
      title: t.resultTitle,
      body: t.resultBody,
      node: (
        <View style={styles.gap}>
          <ExpenditureSummary spend={spend} skippedNotes={skippedNotes} />
          <Card style={styles.gapSm}>
            <Text variant="overline" color="textSubtle">
              {t.bmr}
            </Text>
            <Text variant="heading" style={styles.tabular}>
              {format(t.kcalPerDay, { value: formatEnergy(spend.bmr) })}
            </Text>
            <Text variant="body" color="textMuted">
              {t.bmrExplain}
            </Text>
            <Text variant="caption" color="textSubtle">
              {spend.formula === 'katch' ? g.formulaKatch : g.formulaMifflin}
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
                      label={format(t.rateValue, { value: formatBodyWeight(option, undefined, 2) })}
                      selected={rate === option}
                      onPress={() => setRate(option)}
                    />
                  ))}
                </View>
                {goalType === 'gain' ? (
                  <Text variant="caption" color="textSubtle">
                    {format(g.gainRateHint, { range: formatWeightRange(GAIN_RATE_OPTIONS[0], GAIN_RATE_OPTIONS[GAIN_RATE_OPTIONS.length - 1]) })}
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
              {formatEnergy(plan.targetKcal)}
            </Text>
            <Text variant="body" color="textMuted">
              {plan.goal === 'recomp'
                ? g.recompNote
                : plan.goal === 'maintain' || plan.weeksToGoal === null
                  ? t.maintainNote
                  : format(t.eta, { date: numericDate(goalDate(now, plan.weeksToGoal)), weeks: plan.weeksToGoal })}
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
        <StyleStep
          style={style}
          onStyle={setStyle}
          proteinLevel={proteinLevel ?? suggestedLevel}
          suggestedLevel={suggestedLevel}
          onProteinLevel={setProteinLevel}
          macros={macros}
          weightKg={weight}
          input={macroInput}
          onInput={setMacroInput}
          locked={lockedMacros}
          onLocked={setLockedMacros}
          onMacros={(next) => {
            setManual(next);
            setStyle('custom');
          }}
        />
      ),
    },
    meals: {
      title: m.mealsTitle,
      body: m.mealsBody,
      node: <MealsStep plan={mealPlan} onPlan={setMealPlan} kcal={plan.targetKcal} />,
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
                  {weekdayOrder().map((day) => {
                    const label = g.weekdaysShort[day];
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
                    {format(g.cyclingExtraValue, { value: formatEnergy(cycling.extraKcal) })}
                  </Text>
                </View>
                <Slider
                  value={cycling.extraKcal}
                  min={100}
                  max={700}
                  step={50}
                  onChange={(extraKcal) => setCycling((c) => ({ ...c, extraKcal }))}
                  accessibilityLabel={g.cyclingExtra}
                  accessibilityValueText={format(g.cyclingExtraValue, { value: formatEnergy(cycling.extraKcal) })}
                />
              </Card>
              <Card style={styles.gapSm}>
                <View style={styles.weekRow}>
                  {weekdayOrder().map((day) => {
                    const kcal = week.perDay[day];
                    const high = cycling.highDays.includes(day as Weekday);
                    return (
                      <View key={day} style={styles.weekDay} accessible accessibilityLabel={`${g.weekdaysShort[day]} ${formatEnergy(kcal)}`}>
                        <Text variant="caption" color="textSubtle">
                          {g.weekdaysShort[day]}
                        </Text>
                        <Text variant="label" color={high ? 'accentText' : 'text'} style={styles.tabular}>
                          {formatEnergyBare(kcal)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text variant="caption" color="textSubtle">
                  {format(g.weekBudget, { value: formatEnergy(plan.targetKcal * 7) })}
                </Text>
                {week.limited ? (
                  <Text variant="caption" color="textMuted">
                    {format(g.cyclingLimited, { floor: formatEnergy(floor) })}
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

function NumberRow({ label, hint, toggle, children }: { label: string; hint?: string; toggle?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.numberRow}>
      <View style={[styles.flex, styles.gapXs]}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textSubtle">
            {hint}
          </Text>
        ) : null}
        {toggle ? <View style={styles.toggle}>{toggle}</View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    gapXs: {
      gap: spacing.xs,
    },
    toggle: {
      alignItems: 'flex-start',
    },
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
