import type { ActivityLevel, PregnancyStatus, Sex } from './energy';

/**
 * Water goal. A recommendation, not a rule: drinks in addition to food.
 *
 * Sources: EFSA (2010) adequate intake of total water 2.0 l/day for women and
 * 2.5 l/day for men, of which about 80 % comes from drinks; +0.3 l in
 * pregnancy and +0.7 l while breastfeeding. Valtion ravitsemusneuvottelukunta
 * (2024): 1–1.5 l of drinks a day in addition to food, more with exercise and
 * heat. Body-weight rule of thumb about 30 ml/kg total water. Exercise adds
 * roughly 0.4–0.8 l per hour (ACSM).
 *
 * Safety: the goal is capped at 4 litres and the app never rewards drinking
 * more than the goal. Very large amounts trigger a calm caution instead.
 */

export type DrinkType = 'water' | 'sparkling' | 'tea' | 'coffee' | 'milk' | 'juice' | 'sports' | 'other';

export const DRINK_TYPES: readonly DrinkType[] = ['water', 'sparkling', 'tea', 'coffee', 'milk', 'juice', 'sports', 'other'];

/** Drinks that also contain energy: the app suggests logging them in the diary too. */
export const DRINKS_WITH_ENERGY: ReadonlySet<DrinkType> = new Set(['milk', 'juice', 'sports']);

/** Quick sizes (ml): 1 dl, a small glass, a glass, a can, a bottle. */
export const SERVING_SIZES_ML: readonly number[] = [100, 200, 250, 330, 500];

export const MIN_GOAL_ML = 1000;
export const MAX_GOAL_ML = 4000;
/** Above this in one day the app shows a calm caution (never a reward). */
export const CAUTION_DAY_ML = 4000;
/** One day cannot hold more than this (typo guard). */
export const MAX_DAY_ML = 8000;
/** Default glass for the one-tap button. */
export const DEFAULT_GLASS_ML = 250;
/** Goal when nothing is known about the person (upper end of the VRN range). */
export const DEFAULT_GOAL_ML = 1500;

/** Drinks share of the body-weight rule (30 ml/kg total water, ~80 % from drinks). */
const ML_PER_KG = 24;
const BASE_MIN_ML = 1200;
const BASE_MAX_ML = 2600;
const SEX_BASE_ML: Record<Sex, number> = { female: 1600, male: 2000 };
const ACTIVITY_EXTRA_ML: Record<ActivityLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 250, 5: 500 };
/** Per hour of exercise; capped so a long day out never sets an extreme goal. */
const EXERCISE_ML_PER_HOUR = 500;
const EXERCISE_MAX_EXTRA_ML = 1500;
const HEAT_EXTRA_ML = 500;
const PREGNANCY_EXTRA_ML: Record<PregnancyStatus, number> = { none: 0, pregnant: 300, breastfeeding: 700 };

export type HydrationProfile = {
  weightKg: number | null;
  sex: Sex | null;
  activity: ActivityLevel;
  pregnancy: PregnancyStatus;
};

/** Things that change one day's need: exercise and heat. */
export type DayExtras = { exerciseMin: number; hot: boolean };
export const NO_EXTRAS: DayExtras = { exerciseMin: 0, hot: false };

export type GoalPartKey = 'base' | 'activity' | 'pregnancy' | 'breastfeeding' | 'exercise' | 'heat';
export type GoalPart = { key: GoalPartKey; ml: number };

export type WaterGoal = {
  totalMl: number;
  /** How the goal was built, for the "Miten tavoite lasketaan" breakdown. */
  parts: GoalPart[];
  /** What the base came from. */
  basis: 'weight' | 'sex' | 'default' | 'manual';
};

const round50 = (ml: number) => Math.round(ml / 50) * 50;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** The person's everyday base and the extras that do not change day to day. */
function personalParts(profile: HydrationProfile): { parts: GoalPart[]; basis: WaterGoal['basis'] } {
  let base: number;
  let basis: WaterGoal['basis'];
  if (profile.weightKg !== null && profile.weightKg > 0) {
    base = clamp(round50(profile.weightKg * ML_PER_KG), BASE_MIN_ML, BASE_MAX_ML);
    basis = 'weight';
  } else if (profile.sex !== null) {
    base = SEX_BASE_ML[profile.sex];
    basis = 'sex';
  } else {
    base = DEFAULT_GOAL_ML;
    basis = 'default';
  }
  const parts: GoalPart[] = [{ key: 'base', ml: base }];
  if (ACTIVITY_EXTRA_ML[profile.activity] > 0) parts.push({ key: 'activity', ml: ACTIVITY_EXTRA_ML[profile.activity] });
  if (profile.pregnancy === 'pregnant') parts.push({ key: 'pregnancy', ml: PREGNANCY_EXTRA_ML.pregnant });
  if (profile.pregnancy === 'breastfeeding') parts.push({ key: 'breastfeeding', ml: PREGNANCY_EXTRA_ML.breastfeeding });
  return { parts, basis };
}

/** Extra need for one day: exercise minutes and a hot day. */
export function dayParts(extras: DayExtras): GoalPart[] {
  const parts: GoalPart[] = [];
  const exercise = Math.min(EXERCISE_MAX_EXTRA_ML, round50((Math.max(0, extras.exerciseMin) / 60) * EXERCISE_ML_PER_HOUR));
  if (exercise > 0) parts.push({ key: 'exercise', ml: exercise });
  if (extras.hot) parts.push({ key: 'heat', ml: HEAT_EXTRA_ML });
  return parts;
}

function total(parts: readonly GoalPart[]): number {
  return clamp(round50(parts.reduce((sum, part) => sum + part.ml, 0)), MIN_GOAL_ML, MAX_GOAL_ML);
}

/** Recommended goal for a person on a given day. */
export function recommendedWaterGoal(profile: HydrationProfile, extras: DayExtras = NO_EXTRAS): WaterGoal {
  const personal = personalParts(profile);
  const parts = [...personal.parts, ...dayParts(extras)];
  return { totalMl: total(parts), parts, basis: personal.basis };
}

/** Goal set by hand: the person's own number, plus the day's exercise and heat. */
export function manualWaterGoal(manualMl: number, extras: DayExtras = NO_EXTRAS): WaterGoal {
  const parts = [{ key: 'base' as const, ml: clamp(round50(manualMl), MIN_GOAL_ML, MAX_GOAL_ML) }, ...dayParts(extras)];
  return { totalMl: total(parts), parts, basis: 'manual' };
}

/** A logged drink. Every drink counts as fluid; `drink` is for the person's own overview. */
export type WaterEntry = {
  id: string;
  date: string;
  /** "HH:MM", or null for amounts moved over from the old daily totals. */
  time: string | null;
  ml: number;
  drink: DrinkType;
};

export function totalOn(entries: readonly WaterEntry[], date: string): number {
  return entries.reduce((sum, entry) => (entry.date === date ? sum + entry.ml : sum), 0);
}

/** Daily totals, for charts, reports and achievements. */
export function totalsByDate(entries: readonly WaterEntry[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const entry of entries) totals[entry.date] = (totals[entry.date] ?? 0) + entry.ml;
  return totals;
}

/** Amount by drink type on a day, largest first. */
export function byDrink(entries: readonly WaterEntry[], date: string): { drink: DrinkType; ml: number }[] {
  const sums = new Map<DrinkType, number>();
  for (const entry of entries) if (entry.date === date) sums.set(entry.drink, (sums.get(entry.drink) ?? 0) + entry.ml);
  return [...sums.entries()].map(([drink, ml]) => ({ drink, ml })).sort((a, b) => b.ml - a.ml);
}

/** How much can still be added on a day without passing the typo guard. */
export function roomLeft(entries: readonly WaterEntry[], date: string): number {
  return Math.max(0, MAX_DAY_ML - totalOn(entries, date));
}

export function isAboveCaution(ml: number): boolean {
  return ml > CAUTION_DAY_ML;
}

/**
 * Days in a row the goal was reached, counting back from today; today counts
 * only once reached, so an ongoing day never breaks the streak.
 */
export function waterStreak(
  totals: Readonly<Record<string, number>>,
  goalFor: (date: string) => number,
  today: string,
  previousDay: (date: string) => string,
): number {
  let streak = 0;
  let date = today;
  if ((totals[date] ?? 0) < goalFor(date)) date = previousDay(date);
  while ((totals[date] ?? 0) >= goalFor(date) && (totals[date] ?? 0) > 0) {
    streak += 1;
    date = previousDay(date);
  }
  return streak;
}

/** Evenly spaced reminder hours between start and end (inclusive), e.g. 9, 11, 13 … */
export function reminderHours(startHour: number, endHour: number, everyHours: number): number[] {
  const hours: number[] = [];
  const step = Math.max(1, Math.round(everyHours));
  for (let hour = Math.max(0, startHour); hour <= Math.min(23, endHour); hour += step) hours.push(hour);
  return hours;
}
