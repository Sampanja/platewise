import type { Macros } from '@/data/types';

/**
 * Energy need and weight goal calculations. Pure functions; every safety rule
 * lives here so it is unit tested and cannot be bypassed by the UI.
 */

/** Biological sex, used only because the BMR formula differs. */
export type Sex = 'female' | 'male';

/** Everyday activity outside planned exercise, 1 (least) … 5 (most). Described as the type of work. */
export type ActivityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * lose = weight loss, maintain, gain = muscle gain with a moderate surplus,
 * recomp = body recomposition (a small deficit with high protein and strength training).
 */
export type GoalType = 'lose' | 'maintain' | 'gain' | 'recomp';

export type PregnancyStatus = 'none' | 'pregnant' | 'breastfeeding';

export type WorkoutType = 'walk' | 'run' | 'cycle' | 'gym' | 'swim' | 'ball' | 'yoga' | 'other';
export type Workout = { type: WorkoutType; perWeek: number; minutes: number };

export type BodyInfo = {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  /** Planned exercise sessions per week (0–14). Used when no workouts are listed. */
  exercisePerWeek: number;
  pregnancy: PregnancyStatus;
  /** Optional body fat %: enables the Katch–McArdle formula. */
  bodyFatPct?: number | null;
  /** Optional average daily steps: replaces the work-type level for everyday activity. */
  steps?: number | null;
  /** Optional workouts by type, frequency and duration: replaces exercisePerWeek. */
  workouts?: readonly Workout[];
};

export type GoalChoice = {
  type: GoalType;
  /** Desired change per week in kg (positive number). Ignored for maintain and recomp. */
  rateKgPerWeek: number;
  /** Ignored for maintain and recomp. */
  targetWeightKg: number;
};

/** Everyday activity factors (physical activity level without exercise). */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  1: 1.2,
  2: 1.3,
  3: 1.4,
  4: 1.55,
  5: 1.7,
};
/** Each weekly exercise session adds this to the activity factor. */
export const EXERCISE_FACTOR_PER_SESSION = 0.035;
export const MAX_ACTIVITY_FACTOR = 2.0;
/** Upper bound for total expenditure relative to BMR with detailed workouts (very active athletes). */
export const MAX_TOTAL_FACTOR = 2.5;

/** Energy in one kilogram of body fat. */
export const KCAL_PER_KG = 7700;
/** Calorie floor by sex: the target never goes below this. */
export const KCAL_FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };
/** Largest allowed deficit as a share of total expenditure. */
export const MAX_DEFICIT_SHARE = 0.25;
/** Largest surplus for muscle gain as a share of expenditure ("maltillinen ylijäämä"). */
export const MAX_SURPLUS_SHARE = 0.15;
/** Recomposition: a small deficit as a share of expenditure. */
export const RECOMP_DEFICIT_SHARE = 0.1;
/** Lowest healthy BMI; a target weight below it is not accepted. */
export const MIN_HEALTHY_BMI = 18.5;
export const ADULT_AGE = 18;
export const RATE_OPTIONS = [0.25, 0.5, 0.75] as const;
/** Muscle gain is slow: at most a few hundred grams a week. */
export const GAIN_RATE_OPTIONS = [0.1, 0.25, 0.4] as const;
export const BODY_FAT_RANGE = { min: 5, max: 60 } as const;

/** Mifflin–St Jeor resting energy expenditure (kcal/day). */
export function bmrMifflin(body: Pick<BodyInfo, 'sex' | 'ageYears' | 'heightCm' | 'weightKg'>): number {
  const base = 10 * body.weightKg + 6.25 * body.heightCm - 5 * body.ageYears;
  return base + (body.sex === 'male' ? 5 : -161);
}

/** Katch–McArdle: 370 + 21.6 × lean body mass (kg). More accurate when body fat is known. */
export function bmrKatch(weightKg: number, bodyFatPct: number): number {
  const leanMass = weightKg * (1 - bodyFatPct / 100);
  return 370 + 21.6 * leanMass;
}

export type BmrFormula = 'mifflin' | 'katch';

function validBodyFat(pct: number | null | undefined): pct is number {
  return typeof pct === 'number' && pct >= BODY_FAT_RANGE.min && pct <= BODY_FAT_RANGE.max;
}

export function bmr(body: BodyInfo): { kcal: number; formula: BmrFormula } {
  return validBodyFat(body.bodyFatPct)
    ? { kcal: bmrKatch(body.weightKg, body.bodyFatPct), formula: 'katch' }
    : { kcal: bmrMifflin(body), formula: 'mifflin' };
}

export function activityFactor(activity: ActivityLevel, exercisePerWeek: number): number {
  const sessions = Math.max(0, Math.min(14, exercisePerWeek));
  return Math.min(MAX_ACTIVITY_FACTOR, ACTIVITY_FACTORS[activity] + sessions * EXERCISE_FACTOR_PER_SESSION);
}

/** Everyday activity factor from average daily steps (exercise excluded). */
export function stepsFactor(steps: number): number {
  if (steps < 4000) return 1.2;
  if (steps < 7000) return 1.3;
  if (steps < 10000) return 1.4;
  if (steps < 13000) return 1.5;
  return 1.6;
}

/** Metabolic equivalents (MET) for common workouts at a moderate effort. */
export const WORKOUT_MET: Record<WorkoutType, number> = {
  walk: 4.3,
  run: 9.0,
  cycle: 7.0,
  gym: 5.0,
  swim: 7.0,
  ball: 7.0,
  yoga: 2.5,
  other: 5.0,
};

/** Extra energy from workouts per day: net MET (above rest) × kg × hours, averaged over the week. */
export function workoutKcalPerDay(workouts: readonly Workout[], weightKg: number): number {
  const weekly = workouts.reduce((sum, w) => {
    const perWeek = Math.max(0, Math.min(14, w.perWeek));
    const hours = Math.max(0, Math.min(240, w.minutes)) / 60;
    return sum + (WORKOUT_MET[w.type] - 1) * weightKg * hours * perWeek;
  }, 0);
  return weekly / 7;
}

export type Expenditure = {
  bmr: number;
  formula: BmrFormula;
  /** Everyday activity factor (work type or steps). */
  everydayFactor: number;
  /** Average extra energy from exercise per day. */
  exerciseKcal: number;
  tdee: number;
};

/** Total daily energy expenditure, broken down so the UI can explain it. */
export function expenditure(body: BodyInfo): Expenditure {
  const base = bmr(body);
  const everydayFactor = body.steps != null && body.steps > 0 ? stepsFactor(body.steps) : ACTIVITY_FACTORS[body.activity];
  let exerciseKcal: number;
  let total: number;
  if (body.workouts && body.workouts.length > 0) {
    exerciseKcal = workoutKcalPerDay(body.workouts, body.weightKg);
    total = Math.min(base.kcal * MAX_TOTAL_FACTOR, base.kcal * everydayFactor + exerciseKcal);
  } else {
    const sessions = Math.max(0, Math.min(14, body.exercisePerWeek));
    const factor = Math.min(MAX_ACTIVITY_FACTOR, everydayFactor + sessions * EXERCISE_FACTOR_PER_SESSION);
    total = base.kcal * factor;
    exerciseKcal = total - base.kcal * everydayFactor;
  }
  return { bmr: base.kcal, formula: base.formula, everydayFactor, exerciseKcal, tdee: total };
}

/** Total daily energy expenditure. */
export function tdee(body: BodyInfo): number {
  return expenditure(body).tdee;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** Lowest target weight we accept (BMI 18.5), rounded up to 0.5 kg. */
export function minHealthyWeightKg(heightCm: number): number {
  const m = heightCm / 100;
  return Math.ceil(MIN_HEALTHY_BMI * m * m * 2) / 2;
}

/** Why the plan differs from what was asked. Shown to the user in friendly words. */
export type Adjustment =
  | 'minor'
  | 'pregnancy'
  | 'underweightTarget'
  | 'alreadyUnderweight'
  | 'targetNotBelow'
  | 'targetNotAbove'
  | 'maxDeficit'
  | 'maxSurplus'
  | 'floor'
  /** Expenditure is already at the calorie floor: no safe deficit is possible. */
  | 'noRoomForDeficit';

export type EnergyPlan = {
  bmr: number;
  tdee: number;
  /** The goal type actually used (a weight-loss goal may become maintenance). */
  goal: GoalType;
  /** Daily calorie target after all safety rules. */
  targetKcal: number;
  /** What the chosen rate alone would have given. */
  requestedKcal: number;
  /** Expected change per week at the target (negative = loss). */
  weeklyChangeKg: number;
  /** Target weight after safety rules (equals current weight for maintenance and recomposition). */
  targetWeightKg: number;
  /** Weeks to reach the target, or null for maintenance and recomposition. */
  weeksToGoal: number | null;
  adjustments: Adjustment[];
};

const round = (value: number, step = 1) => Math.round(value / step) * step;

export type PlanOptions = {
  /**
   * Expenditure measured from the user's own weight and food log (adaptive
   * estimate). Replaces the formula; all safety rules still apply.
   */
  tdeeOverride?: number;
};

/**
 * Daily calorie target for a goal, with the mandatory safety rules:
 * - under 18 and pregnant or breastfeeding: no deficit (maintenance instead,
 *   also for recomposition, which needs a small deficit);
 * - a target weight below BMI 18.5 is not accepted (raised to the limit), and
 *   someone already under it gets maintenance instead of weight loss;
 * - the deficit is at most 25 % of total expenditure;
 * - the surplus for muscle gain is at most 15 % of expenditure;
 * - the target never goes below 1 200 kcal (women) / 1 500 kcal (men).
 */
export function planEnergy(body: BodyInfo, choice: GoalChoice, options: PlanOptions = {}): EnergyPlan {
  const base = bmr(body).kcal;
  const total = options.tdeeOverride ?? tdee(body);
  const adjustments: Adjustment[] = [];
  let goal = choice.type;
  let targetWeight = choice.targetWeightKg;

  const deficitBlocked = (): boolean => {
    if (body.ageYears < ADULT_AGE) {
      adjustments.push('minor');
      return true;
    }
    if (body.pregnancy !== 'none') {
      adjustments.push('pregnancy');
      return true;
    }
    return false;
  };

  if (goal === 'lose') {
    if (deficitBlocked()) {
      goal = 'maintain';
    } else if (bmi(body.weightKg, body.heightCm) <= MIN_HEALTHY_BMI) {
      adjustments.push('alreadyUnderweight');
      goal = 'maintain';
    } else {
      const minWeight = minHealthyWeightKg(body.heightCm);
      if (targetWeight < minWeight) {
        adjustments.push('underweightTarget');
        targetWeight = minWeight;
      }
      if (targetWeight >= body.weightKg) {
        adjustments.push('targetNotBelow');
        goal = 'maintain';
      }
    }
  } else if (goal === 'recomp') {
    if (deficitBlocked()) goal = 'maintain';
    else if (bmi(body.weightKg, body.heightCm) <= MIN_HEALTHY_BMI) {
      adjustments.push('alreadyUnderweight');
      goal = 'maintain';
    }
  } else if (goal === 'gain' && targetWeight <= body.weightKg) {
    adjustments.push('targetNotAbove');
    goal = 'maintain';
  }

  const dailyDelta = goal === 'lose' || goal === 'gain' ? (choice.rateKgPerWeek * KCAL_PER_KG) / 7 : 0;
  const requested =
    goal === 'lose'
      ? total - dailyDelta
      : goal === 'gain'
        ? total + dailyDelta
        : goal === 'recomp'
          ? total * (1 - RECOMP_DEFICIT_SHARE)
          : total;
  let target = requested;

  if (goal === 'lose') {
    const maxDeficitTarget = total * (1 - MAX_DEFICIT_SHARE);
    if (target < maxDeficitTarget) {
      adjustments.push('maxDeficit');
      target = maxDeficitTarget;
    }
  }
  if (goal === 'gain') {
    const maxSurplusTarget = total * (1 + MAX_SURPLUS_SHARE);
    if (target > maxSurplusTarget) {
      adjustments.push('maxSurplus');
      target = maxSurplusTarget;
    }
  }
  const floor = KCAL_FLOOR[body.sex];
  if (target < floor) {
    adjustments.push('floor');
    target = floor;
  }
  if ((goal === 'lose' || goal === 'recomp') && target >= total) {
    // The floor leaves no deficit at all: a "loss" goal would mean gaining.
    adjustments.push('noRoomForDeficit');
    goal = 'maintain';
    targetWeight = body.weightKg;
  }

  const targetKcal = round(target, 10);
  const changes = goal === 'lose' || goal === 'gain';
  const weeklyChangeKg = changes ? ((targetKcal - total) * 7) / KCAL_PER_KG : 0;
  const weeksToGoal =
    !changes || weeklyChangeKg === 0
      ? null
      : Math.ceil(Math.abs(targetWeight - body.weightKg) / Math.abs(weeklyChangeKg));

  return {
    bmr: round(base),
    tdee: round(total),
    goal,
    targetKcal,
    requestedKcal: round(requested, 10),
    weeklyChangeKg,
    targetWeightKg: changes ? targetWeight : body.weightKg,
    weeksToGoal: weeksToGoal !== null && weeksToGoal >= 0 && Number.isFinite(weeksToGoal) ? weeksToGoal : null,
    adjustments: [...new Set(adjustments)],
  };
}

/** Protein per kg of (reference) body weight by goal. Higher while losing or recomposing to keep muscle. */
export const PROTEIN_G_PER_KG: Record<GoalType, number> = { lose: 1.8, maintain: 1.4, gain: 1.6, recomp: 2.0 };
/** Fat at least this share of energy. */
export const MIN_FAT_SHARE = 0.25;

/** Eating styles that preset the macros. Every style keeps fat ≥ 25 % of energy. */
export type DietStyle = 'balanced' | 'highProtein' | 'lowCarb' | 'plant';
export const DIET_STYLES: readonly DietStyle[] = ['balanced', 'highProtein', 'lowCarb', 'plant'];

/** Low-carb here is moderate: a quarter of energy, never under 100 g (not a ketogenic diet). */
export const LOW_CARB_SHARE = 0.25;
export const LOW_CARB_MIN_G = 100;

/**
 * Macro targets for a calorie target. Protein is g/kg of a reference weight
 * (current weight, but at most the weight at BMI 25 so protein does not
 * balloon with high body weight), fat at least 25 % of energy, carbohydrates
 * the rest. The eating style shifts the split:
 * - balanced: as above, carbohydrates at least 40 % of energy;
 * - highProtein: +0.4 g/kg protein, carbohydrates at least 30 %;
 * - lowCarb: carbohydrates 25 % of energy (min 100 g), fat the rest;
 * - plant: +10 % protein (plant protein is a little less digestible).
 */
export function macroTargets(
  kcal: number,
  goal: GoalType,
  weightKg: number,
  heightCm: number,
  style: DietStyle = 'balanced',
): Macros {
  const m = heightCm / 100;
  const referenceWeight = Math.min(weightKg, 25 * m * m);
  let perKg = PROTEIN_G_PER_KG[goal];
  if (style === 'highProtein') perKg += 0.4;
  if (style === 'plant') perKg *= 1.1;
  let proteinG = perKg * referenceWeight;

  if (style === 'lowCarb') {
    const carbsG = Math.max(LOW_CARB_MIN_G, (kcal * LOW_CARB_SHARE) / 4);
    // Protein is capped so that fat keeps at least its minimum share.
    const maxProteinKcal = kcal - carbsG * 4 - kcal * MIN_FAT_SHARE;
    if (proteinG * 4 > maxProteinKcal) proteinG = Math.max(0, maxProteinKcal / 4);
    const fatG = Math.max(0, (kcal - proteinG * 4 - carbsG * 4) / 9);
    return { kcal: Math.round(kcal), proteinG: round(proteinG, 5), carbsG: round(carbsG, 5), fatG: round(fatG, 5) };
  }

  const fatG = (kcal * MIN_FAT_SHARE) / 9;
  const minCarbShare = style === 'highProtein' ? 0.3 : 0.4;
  // Keep the minimum carbohydrate share by trimming protein if needed.
  const maxProteinKcal = kcal * (1 - MIN_FAT_SHARE - minCarbShare);
  if (proteinG * 4 > maxProteinKcal) proteinG = maxProteinKcal / 4;
  const carbsG = Math.max(0, (kcal - proteinG * 4 - fatG * 9) / 4);
  return {
    kcal: Math.round(kcal),
    proteinG: round(proteinG, 5),
    carbsG: round(carbsG, 5),
    fatG: round(fatG, 5),
  };
}

/** Date the target is expected to be reached. */
export function goalDate(from: Date, weeks: number): Date {
  const date = new Date(from);
  date.setDate(date.getDate() + weeks * 7);
  return date;
}

// ---------------------------------------------------------------------------
// Calorie cycling ("kalorien jaksotus")

/** Weekday index 0 = Monday … 6 = Sunday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Cycling = {
  enabled: boolean;
  /** Days that get more energy, e.g. Saturday and Sunday. */
  highDays: Weekday[];
  /** Extra kcal on each high day; the other days give the same total back. */
  extraKcal: number;
};

export const DEFAULT_CYCLING: Cycling = { enabled: false, highDays: [5, 6], extraKcal: 300 };

export type CycledWeek = {
  /** Daily targets Monday … Sunday. Their sum is 7 × the daily target. */
  perDay: number[];
  /** True when the extra had to be reduced so low days stay at or above the floor. */
  limited: boolean;
};

/**
 * Splits a weekly budget (7 × daily target) so the chosen days get more and
 * the other days a little less. Safety: low days never go below the calorie
 * floor; the extra is reduced until they don't.
 */
export function cycleWeek(dailyKcal: number, cycling: Cycling, floorKcal: number): CycledWeek {
  const high = [...new Set(cycling.highDays)].filter((d) => d >= 0 && d <= 6);
  if (!cycling.enabled || high.length === 0 || high.length === 7 || cycling.extraKcal <= 0) {
    return { perDay: Array(7).fill(dailyKcal), limited: false };
  }
  const lowCount = 7 - high.length;
  // Low day = daily − extra × high / low. Largest extra that keeps low ≥ floor:
  const maxExtra = Math.max(0, ((dailyKcal - floorKcal) * lowCount) / high.length);
  const extra = Math.min(cycling.extraKcal, maxExtra);
  const lowKcal = dailyKcal - (extra * high.length) / lowCount;
  const perDay = Array.from({ length: 7 }, (_, d) => round(high.includes(d as Weekday) ? dailyKcal + extra : lowKcal, 10));
  return { perDay, limited: extra < cycling.extraKcal };
}

/** Monday-based weekday of a JavaScript date. */
export function weekdayOf(date: Date): Weekday {
  return ((date.getDay() + 6) % 7) as Weekday;
}

// ---------------------------------------------------------------------------
// Weight tracking

export type WeightEntry = { date: string; kg: number };

/**
 * Trailing 7-day average for each logged day: daily water-weight swings even
 * out, so the trend is easier to read than single weigh-ins.
 */
export function movingAverage(entries: readonly WeightEntry[], days = 7): WeightEntry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const dayMs = 86_400_000;
  return sorted.map((entry) => {
    const end = Date.parse(entry.date);
    const window = sorted.filter((e) => {
      const t = Date.parse(e.date);
      return t <= end && t > end - days * dayMs;
    });
    const avg = window.reduce((sum, e) => sum + e.kg, 0) / window.length;
    return { date: entry.date, kg: Math.round(avg * 10) / 10 };
  });
}

/** Change (kg) in the smoothed weight that makes us suggest recalculating the goal. */
export const RECALC_THRESHOLD_KG = 2;

/** True when the trend has moved far enough from the weight the goal was based on. */
export function shouldSuggestRecalculation(entries: readonly WeightEntry[], basisWeightKg: number): boolean {
  const smoothed = movingAverage(entries);
  const latest = smoothed.at(-1);
  return latest !== undefined && Math.abs(latest.kg - basisWeightKg) >= RECALC_THRESHOLD_KG;
}

/** Share of the way from the start weight to the target, 0–1. */
export function goalProgress(startKg: number, currentKg: number, targetKg: number): number {
  if (startKg === targetKg) return 1;
  const share = (startKg - currentKg) / (startKg - targetKg);
  return Math.max(0, Math.min(1, share));
}

export function ageFromBirthYear(birthYear: number, now: Date): number {
  return now.getFullYear() - birthYear;
}

const DAY_MS = 86_400_000;

/** Least-squares slope of weight over time, kg per day. Null with fewer than two points. */
export function weightSlopePerDay(entries: readonly WeightEntry[]): number | null {
  if (entries.length < 2) return null;
  const t0 = Date.parse(entries[0].date);
  const xs = entries.map((e) => (Date.parse(e.date) - t0) / DAY_MS);
  const ys = entries.map((e) => e.kg);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? null : num / den;
}

export type Milestone = { share: number; kg: number; reached: boolean };

/** Quarter-way milestones from the start weight to the target (25 %, 50 %, 75 %, 100 %). */
export function milestones(startKg: number, currentKg: number, targetKg: number): Milestone[] {
  const progress = goalProgress(startKg, currentKg, targetKg);
  return [0.25, 0.5, 0.75, 1].map((share) => ({
    share,
    kg: Math.round((startKg + (targetKg - startKg) * share) * 10) / 10,
    reached: progress >= share - 1e-9,
  }));
}

/**
 * When the target would be reached at the current trend (last 4 weeks of
 * weigh-ins). Null when the trend is flat, goes the wrong way or there is too
 * little data. The plan's own date is shown next to it.
 */
export function forecastDate(entries: readonly WeightEntry[], targetKg: number, now: Date): Date | null {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted.at(-1);
  if (!last) return null;
  const recent = sorted.filter((e) => Date.parse(e.date) > Date.parse(last.date) - 28 * DAY_MS);
  if (recent.length < 3) return null;
  const slope = weightSlopePerDay(recent);
  if (slope === null || Math.abs(slope) < 0.005) return null;
  const current = movingAverage(sorted).at(-1)?.kg ?? last.kg;
  const days = (targetKg - current) / slope;
  if (days <= 0 || !Number.isFinite(days) || days > 3 * 365) return null;
  return new Date(now.getTime() + days * DAY_MS);
}

// ---------------------------------------------------------------------------
// Adaptive expenditure

export const ADAPTIVE = {
  /** Look-back window. */
  windowDays: 28,
  /** At least two weeks between the first and last weigh-in. */
  minSpanDays: 14,
  minWeighIns: 4,
  minLoggedDays: 10,
  /** Estimates further than this from the formula are treated as unreliable (likely missed logging). */
  maxDeviationShare: 0.35,
} as const;

export type AdaptiveEstimate =
  | {
      status: 'notEnoughData';
      /** Days of weigh-ins so far and logged food days, for the progress message. */
      spanDays: number;
      loggedDays: number;
    }
  | { status: 'unreliable'; tdee: number }
  | {
      status: 'ok';
      tdee: number;
      avgIntake: number;
      weeklyChangeKg: number;
      loggedDays: number;
      weighIns: number;
    };

/**
 * The user's real expenditure from their own data: average logged intake
 * minus the energy stored or released by the weight trend
 * (TDEE = intake − Δweight/day × 7 700). Needs 2–3 weeks of weigh-ins and
 * logged days; days without food entries are skipped, not counted as zero.
 */
export function adaptiveExpenditure(
  weights: readonly WeightEntry[],
  intakeByDate: Readonly<Record<string, number>>,
  today: string,
  formulaTdee: number,
): AdaptiveEstimate {
  const end = Date.parse(today);
  const start = end - ADAPTIVE.windowDays * DAY_MS;
  const inWindow = [...weights]
    .filter((e) => {
      const t = Date.parse(e.date);
      return t > start && t <= end;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  const intakes = Object.entries(intakeByDate).filter(([date, kcal]) => {
    const t = Date.parse(date);
    return t > start && t <= end && kcal > 0;
  });
  const spanDays =
    inWindow.length >= 2 ? Math.round((Date.parse(inWindow.at(-1)!.date) - Date.parse(inWindow[0].date)) / DAY_MS) : 0;

  if (spanDays < ADAPTIVE.minSpanDays || inWindow.length < ADAPTIVE.minWeighIns || intakes.length < ADAPTIVE.minLoggedDays) {
    return { status: 'notEnoughData', spanDays, loggedDays: intakes.length };
  }
  const slope = weightSlopePerDay(inWindow) ?? 0;
  const avgIntake = intakes.reduce((sum, [, kcal]) => sum + kcal, 0) / intakes.length;
  const estimate = avgIntake - slope * KCAL_PER_KG;
  if (Math.abs(estimate - formulaTdee) > formulaTdee * ADAPTIVE.maxDeviationShare) {
    return { status: 'unreliable', tdee: round(estimate, 10) };
  }
  return {
    status: 'ok',
    tdee: round(estimate, 10),
    avgIntake: round(avgIntake, 10),
    weeklyChangeKg: Math.round(slope * 7 * 100) / 100,
    loggedDays: intakes.length,
    weighIns: inWindow.length,
  };
}
