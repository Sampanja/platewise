import type { Macros } from '@/data/types';

/**
 * Energy need and weight goal calculations. Pure functions; every safety rule
 * lives here so it is unit tested and cannot be bypassed by the UI.
 */

/** Biological sex, used only because the BMR formula differs. */
export type Sex = 'female' | 'male';

/** Everyday activity outside planned exercise, 1 (least) … 5 (most). */
export type ActivityLevel = 1 | 2 | 3 | 4 | 5;

export type GoalType = 'lose' | 'maintain' | 'gain';

export type PregnancyStatus = 'none' | 'pregnant' | 'breastfeeding';

export type BodyInfo = {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  /** Planned exercise sessions per week (0–14). */
  exercisePerWeek: number;
  pregnancy: PregnancyStatus;
};

export type GoalChoice = {
  type: GoalType;
  /** Desired change per week in kg (positive number). Ignored for maintain. */
  rateKgPerWeek: number;
  /** Ignored for maintain. */
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

/** Energy in one kilogram of body fat. */
export const KCAL_PER_KG = 7700;
/** Calorie floor by sex: the target never goes below this. */
export const KCAL_FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };
/** Largest allowed deficit as a share of total expenditure. */
export const MAX_DEFICIT_SHARE = 0.25;
/** Lowest healthy BMI; a target weight below it is not accepted. */
export const MIN_HEALTHY_BMI = 18.5;
export const ADULT_AGE = 18;
export const RATE_OPTIONS = [0.25, 0.5, 0.75] as const;

/** Mifflin–St Jeor resting energy expenditure (kcal/day). */
export function bmrMifflin(body: Pick<BodyInfo, 'sex' | 'ageYears' | 'heightCm' | 'weightKg'>): number {
  const base = 10 * body.weightKg + 6.25 * body.heightCm - 5 * body.ageYears;
  return base + (body.sex === 'male' ? 5 : -161);
}

export function activityFactor(activity: ActivityLevel, exercisePerWeek: number): number {
  const sessions = Math.max(0, Math.min(14, exercisePerWeek));
  return Math.min(MAX_ACTIVITY_FACTOR, ACTIVITY_FACTORS[activity] + sessions * EXERCISE_FACTOR_PER_SESSION);
}

/** Total daily energy expenditure: BMR × activity factor. */
export function tdee(body: BodyInfo): number {
  return bmrMifflin(body) * activityFactor(body.activity, body.exercisePerWeek);
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
  | 'floor';

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
  /** Target weight after safety rules (equals current weight for maintenance). */
  targetWeightKg: number;
  /** Weeks to reach the target, or null for maintenance. */
  weeksToGoal: number | null;
  adjustments: Adjustment[];
};

const round = (value: number, step = 1) => Math.round(value / step) * step;

/**
 * Daily calorie target for a goal, with the mandatory safety rules:
 * - under 18 and pregnant or breastfeeding: no deficit (maintenance instead);
 * - a target weight below BMI 18.5 is not accepted (raised to the limit), and
 *   someone already under it gets maintenance instead of weight loss;
 * - the deficit is at most 25 % of total expenditure;
 * - the target never goes below 1 200 kcal (women) / 1 500 kcal (men).
 */
export function planEnergy(body: BodyInfo, choice: GoalChoice): EnergyPlan {
  const bmr = bmrMifflin(body);
  const total = tdee(body);
  const adjustments: Adjustment[] = [];
  let goal = choice.type;
  let targetWeight = choice.targetWeightKg;

  if (goal === 'lose') {
    if (body.ageYears < ADULT_AGE) {
      adjustments.push('minor');
      goal = 'maintain';
    } else if (body.pregnancy !== 'none') {
      adjustments.push('pregnancy');
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
  } else if (goal === 'gain' && targetWeight <= body.weightKg) {
    adjustments.push('targetNotAbove');
    goal = 'maintain';
  }

  const dailyDelta = goal === 'maintain' ? 0 : (choice.rateKgPerWeek * KCAL_PER_KG) / 7;
  const requested = goal === 'lose' ? total - dailyDelta : goal === 'gain' ? total + dailyDelta : total;
  let target = requested;

  if (goal === 'lose') {
    const maxDeficitTarget = total * (1 - MAX_DEFICIT_SHARE);
    if (target < maxDeficitTarget) {
      adjustments.push('maxDeficit');
      target = maxDeficitTarget;
    }
  }
  const floor = KCAL_FLOOR[body.sex];
  if (target < floor) {
    adjustments.push('floor');
    target = floor;
  }

  const targetKcal = round(target, 10);
  const weeklyChangeKg = goal === 'maintain' ? 0 : ((targetKcal - total) * 7) / KCAL_PER_KG;
  const weeksToGoal =
    goal === 'maintain' || weeklyChangeKg === 0
      ? null
      : Math.ceil(Math.abs(targetWeight - body.weightKg) / Math.abs(weeklyChangeKg));

  return {
    bmr: round(bmr),
    tdee: round(total),
    goal,
    targetKcal,
    requestedKcal: round(requested, 10),
    weeklyChangeKg,
    targetWeightKg: goal === 'maintain' ? body.weightKg : targetWeight,
    weeksToGoal: weeksToGoal !== null && weeksToGoal >= 0 && Number.isFinite(weeksToGoal) ? weeksToGoal : null,
    adjustments: [...new Set(adjustments)],
  };
}

/** Protein per kg of (reference) body weight by goal. Higher while losing to keep muscle. */
export const PROTEIN_G_PER_KG: Record<GoalType, number> = { lose: 1.8, maintain: 1.4, gain: 1.6 };
/** Fat at least this share of energy. */
export const MIN_FAT_SHARE = 0.25;

/**
 * Macro targets for a calorie target. Protein is g/kg of a reference weight
 * (current weight, but at most the weight at BMI 25 so protein does not
 * balloon with high body weight), fat at least 25 % of energy, carbohydrates
 * the rest.
 */
export function macroTargets(
  kcal: number,
  goal: GoalType,
  weightKg: number,
  heightCm: number,
): Macros {
  const m = heightCm / 100;
  const referenceWeight = Math.min(weightKg, 25 * m * m);
  let proteinG = PROTEIN_G_PER_KG[goal] * referenceWeight;
  const fatG = (kcal * MIN_FAT_SHARE) / 9;
  // Keep at least 40 % of energy for carbohydrates by trimming protein if needed.
  const maxProteinKcal = kcal * (1 - MIN_FAT_SHARE - 0.4);
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
