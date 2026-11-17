/**
 * Everyday activity in three questions, combined into one daily expenditure
 * (domain/energy.ts `expenditure`):
 *
 * 1. What the day is mostly about (work or school): five levels with everyday
 *    examples, a few life situations, and a search over ~100 occupations.
 * 2. Everyday movement: the trip to work or school, daily steps (if known)
 *    and leisure chores (dog walks, yard work…).
 * 3. Workouts: type, times a week, duration and intensity.
 *
 * Every question can be skipped; the default used is shown to the user.
 * Energy is BMR × everyday factor + commute + leisure + workouts, with
 * workouts and chores counted as net METs (above rest) so nothing is counted
 * twice. Daily steps describe all walking, so when they are known, walking
 * to work and dog walks are not added again (cycling still is).
 */

/** Everyday activity outside planned exercise, 1 (least) … 5 (most). */
export type ActivityLevel = 1 | 2 | 3 | 4 | 5;
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [1, 2, 3, 4, 5];

/** Physical activity level of a day without exercise, by the main occupation. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  1: 1.2,
  2: 1.3,
  3: 1.4,
  4: 1.55,
  5: 1.7,
};

/** "En tiedä": sitting with some moving, the most common day. */
export const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 2;

/** Situations that are not a job; each counts as one of the levels. */
export const SITUATIONS = ['home', 'retired', 'jobSeeker', 'shift'] as const;
export type Situation = (typeof SITUATIONS)[number];
export const SITUATION_LEVEL: Record<Situation, ActivityLevel> = {
  // Small children keep a parent on their feet most of the day.
  home: 3,
  retired: 2,
  jobSeeker: 2,
  // Most shift work is care, service or industry: standing and walking.
  shift: 3,
};

// ── Everyday movement ───────────────────────────────────────────────────────

export const STEP_BANDS = ['unknown', 'under5k', '5to8k', '8to12k', 'over12k'] as const;
export type StepBand = (typeof STEP_BANDS)[number];

/** A typical step count for each band (the middle of it). */
export const STEP_BAND_STEPS: Record<Exclude<StepBand, 'unknown'>, number> = {
  under5k: 3500,
  '5to8k': 6500,
  '8to12k': 10000,
  over12k: 14000,
};

/** Everyday activity factor from average daily steps (exercise excluded). */
export function stepsFactor(steps: number): number {
  if (steps < 4000) return 1.2;
  if (steps < 7000) return 1.3;
  if (steps < 10000) return 1.4;
  if (steps < 13000) return 1.5;
  return 1.6;
}

export const COMMUTE_MODES = ['none', 'walk', 'bike', 'transit', 'car'] as const;
export type CommuteMode = (typeof COMMUTE_MODES)[number];
/** Minutes per day there and back. */
export const COMMUTE_MINUTES = [10, 20, 30, 45, 60, 90] as const;
export type Commute = { mode: CommuteMode; minutesPerDay: number };
export const NO_COMMUTE: Commute = { mode: 'none', minutesPerDay: 0 };
/** Work and school days a week. */
export const COMMUTE_DAYS_PER_WEEK = 5;

/** Net MET (above rest) of each way to travel; transit counts the walk to the stop and standing. */
const COMMUTE_NET_MET: Record<CommuteMode, number> = { none: 0, walk: 2.5, bike: 5.8, transit: 0.8, car: 0 };

export const LEISURE = ['dog', 'garden', 'housework', 'kids', 'diy'] as const;
export type Leisure = (typeof LEISURE)[number];
/** Typical weekly time and net MET of each chore. */
const LEISURE_LOAD: Record<Leisure, { hoursPerWeek: number; netMet: number; walking: boolean }> = {
  dog: { hoursPerWeek: 5, netMet: 2.0, walking: true },
  garden: { hoursPerWeek: 2, netMet: 3.0, walking: false },
  housework: { hoursPerWeek: 4, netMet: 2.3, walking: false },
  kids: { hoursPerWeek: 5, netMet: 2.0, walking: false },
  diy: { hoursPerWeek: 2, netMet: 2.0, walking: false },
};

// ── Workouts ────────────────────────────────────────────────────────────────

export const WORKOUT_TYPES = ['gym', 'run', 'cycle', 'swim', 'team', 'dance', 'yoga', 'walk', 'martial', 'other'] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];
export const INTENSITIES = ['light', 'moderate', 'hard'] as const;
export type Intensity = (typeof INTENSITIES)[number];
export type Workout = { type: WorkoutType; perWeek: number; minutes: number; intensity: Intensity };

/** METs by type and intensity (Compendium of Physical Activities, rounded). */
export const WORKOUT_MET: Record<WorkoutType, Record<Intensity, number>> = {
  gym: { light: 3.5, moderate: 5.0, hard: 6.0 },
  run: { light: 7.0, moderate: 9.0, hard: 11.5 },
  cycle: { light: 5.0, moderate: 7.0, hard: 10.0 },
  swim: { light: 5.0, moderate: 7.0, hard: 9.5 },
  team: { light: 5.0, moderate: 7.0, hard: 8.5 },
  dance: { light: 4.0, moderate: 5.5, hard: 7.3 },
  yoga: { light: 2.5, moderate: 3.0, hard: 4.0 },
  walk: { light: 3.0, moderate: 4.3, hard: 5.5 },
  martial: { light: 5.0, moderate: 7.5, hard: 10.0 },
  other: { light: 3.5, moderate: 5.0, hard: 7.0 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Extra energy from workouts per day: net MET × kg × hours, averaged over the week. */
export function workoutKcalPerDay(workouts: readonly Workout[], weightKg: number): number {
  const weekly = workouts.reduce((sum, w) => {
    const perWeek = clamp(w.perWeek, 0, 14);
    const hours = clamp(w.minutes, 0, 240) / 60;
    return sum + (WORKOUT_MET[w.type][w.intensity] - 1) * weightKg * hours * perWeek;
  }, 0);
  return weekly / 7;
}

/** Extra energy per day from getting to work or school (5 days a week, averaged over 7). */
export function commuteKcalPerDay(commute: Commute, weightKg: number, stepsKnown: boolean): number {
  // Steps already include walking; cycling is not in them.
  if (stepsKnown && commute.mode !== 'bike') return 0;
  const hours = clamp(commute.minutesPerDay, 0, 240) / 60;
  return (COMMUTE_NET_MET[commute.mode] * weightKg * hours * COMMUTE_DAYS_PER_WEEK) / 7;
}

/** Extra energy per day from chores and leisure activity. */
export function leisureKcalPerDay(leisure: readonly Leisure[], weightKg: number, stepsKnown: boolean): number {
  const weekly = [...new Set(leisure)].reduce((sum, item) => {
    const load = LEISURE_LOAD[item];
    if (stepsKnown && load.walking) return sum;
    return sum + load.netMet * weightKg * load.hoursPerWeek;
  }, 0);
  return weekly / 7;
}

/**
 * Everyday factor: the occupation's level, raised by the steps if they tell
 * of a more active day (a desk worker who walks 12 000 steps). A heavy job
 * keeps its level even if the step count is low (lifting is not steps).
 */
export function everydayFactor(level: ActivityLevel, steps: StepBand): number {
  const work = ACTIVITY_FACTORS[level];
  return steps === 'unknown' ? work : Math.max(work, stepsFactor(STEP_BAND_STEPS[steps]));
}

/** A level and a situation to show for an answer of question 1. */
export function levelOf(answer: { level: ActivityLevel | null; situation: Situation | null }): ActivityLevel {
  if (answer.situation) return SITUATION_LEVEL[answer.situation];
  return answer.level ?? DEFAULT_ACTIVITY_LEVEL;
}

/** Old saved workouts had no intensity and called team sports "ball". */
export function migrateWorkout(value: unknown): Workout | null {
  if (typeof value !== 'object' || value === null) return null;
  const w = value as Record<string, unknown>;
  const type = w.type === 'ball' ? 'team' : w.type;
  if (!(WORKOUT_TYPES as readonly unknown[]).includes(type)) return null;
  const perWeek = typeof w.perWeek === 'number' ? clamp(Math.round(w.perWeek), 1, 14) : 2;
  const minutes = typeof w.minutes === 'number' ? clamp(Math.round(w.minutes), 10, 240) : 45;
  const intensity = (INTENSITIES as readonly unknown[]).includes(w.intensity) ? (w.intensity as Intensity) : 'moderate';
  return { type: type as WorkoutType, perWeek, minutes, intensity };
}

/** An old exact step count as the nearest band. */
export function stepBandFor(steps: number | null | undefined): StepBand {
  if (steps == null || steps <= 0) return 'unknown';
  if (steps < 5000) return 'under5k';
  if (steps < 8000) return '5to8k';
  if (steps <= 12000) return '8to12k';
  return 'over12k';
}

// ── Saved answers ───────────────────────────────────────────────────────────

/** The three answers as saved in the profile (body). */
export type ActivityAnswers = {
  activity: ActivityLevel;
  /** The occupation picked from the search, if any (the level is in `activity`). */
  occupation: string | null;
  situation: Situation | null;
  commute: Commute;
  stepBand: StepBand;
  leisure: Leisure[];
  workouts: Workout[];
  /** Questions answered with "En tiedä tai haluan ohittaa": their defaults are shown in the summary. */
  skipped: { work: boolean; everyday: boolean; workouts: boolean };
};

export const DEFAULT_ACTIVITY_ANSWERS: ActivityAnswers = {
  activity: DEFAULT_ACTIVITY_LEVEL,
  occupation: null,
  situation: null,
  commute: NO_COMMUTE,
  stepBand: 'unknown',
  leisure: [],
  workouts: [],
  skipped: { work: false, everyday: false, workouts: false },
};

/** The energy calculation's view of the answers (domain/energy.ts BodyInfo fields). */
export function activityInputs(answers: ActivityAnswers): {
  activity: ActivityLevel;
  exercisePerWeek: number;
  steps: number | null;
  commute: Commute;
  leisure: readonly Leisure[];
  workouts: readonly Workout[];
} {
  return {
    activity: answers.activity,
    exercisePerWeek: 0,
    steps: answers.stepBand === 'unknown' ? null : STEP_BAND_STEPS[answers.stepBand],
    commute: answers.commute,
    leisure: answers.leisure,
    workouts: answers.workouts,
  };
}

const isLevel = (value: unknown): value is ActivityLevel => (ACTIVITY_LEVELS as readonly unknown[]).includes(value);

/**
 * Profile v11: the old activity fields (a work level or exact steps, workouts
 * without intensity, sessions per week) become the three answers. Nothing the
 * user chose is lost; new questions start empty (not skipped).
 */
export function migrateActivityAnswers(body: Record<string, unknown>): ActivityAnswers {
  const activity = isLevel(body.activity) ? body.activity : DEFAULT_ACTIVITY_LEVEL;
  const oldSteps = body.everydayMode === 'steps' && typeof body.steps === 'number' ? body.steps : null;
  const stepBand = (STEP_BANDS as readonly unknown[]).includes(body.stepBand) ? (body.stepBand as StepBand) : stepBandFor(oldSteps);
  const workouts = Array.isArray(body.workouts)
    ? body.workouts.map(migrateWorkout).filter((w): w is Workout => w !== null)
    : [];
  const sessions = typeof body.exercisePerWeek === 'number' ? Math.round(body.exercisePerWeek) : 0;
  if (workouts.length === 0 && sessions > 0) {
    workouts.push({ type: 'other', perWeek: Math.min(14, sessions), minutes: 45, intensity: 'moderate' });
  }
  const commute = body.commute as Partial<Commute> | undefined;
  const skipped = (body.skipped ?? {}) as Partial<ActivityAnswers['skipped']>;
  return {
    activity,
    occupation: typeof body.occupation === 'string' ? body.occupation : null,
    situation: (SITUATIONS as readonly unknown[]).includes(body.situation) ? (body.situation as Situation) : null,
    commute:
      commute && (COMMUTE_MODES as readonly unknown[]).includes(commute.mode) && typeof commute.minutesPerDay === 'number'
        ? { mode: commute.mode as CommuteMode, minutesPerDay: commute.minutesPerDay }
        : NO_COMMUTE,
    stepBand,
    leisure: Array.isArray(body.leisure) ? body.leisure.filter((l): l is Leisure => (LEISURE as readonly unknown[]).includes(l)) : [],
    workouts,
    skipped: { work: skipped.work === true, everyday: skipped.everyday === true, workouts: skipped.workouts === true },
  };
}
