import type { DiaryEntry, DiaryMeal, FoodCategory } from '@/data/types';
import { addDays, parseLocalDate, type LocalDate } from '@/lib/dates';

import { entryMacros } from './diary';

/**
 * XP, levels, streaks, quests, weekly challenges and achievements, derived
 * from what the user already logs (diary, water, weigh-ins, plans). Derived,
 * not counted as events: nothing is counted twice and everything survives a
 * restart.
 *
 * Mandatory rules: only regularity and good habits are rewarded (logging,
 * cooking, water, staying on budget, trying new recipes, reaching the protein
 * goal). Eating less, a bigger deficit or fast weight loss is never rewarded,
 * and nothing is ever taken away (no penalties, XP never decreases).
 */

// ---------------------------------------------------------------------------
// Daily activity

export type DayActivity = {
  date: LocalDate;
  entries: number;
  meals: DiaryMeal[];
  /** Distinct recipe ids logged (library or own). */
  recipes: string[];
  /** Entries of vegetables, fruit or berries. */
  vegEntries: number;
  /** Entries added from a photo. */
  photoEntries: number;
  waterReached: boolean;
  proteinReached: boolean;
  weighed: boolean;
};

export type ActivityInput = {
  entries: readonly DiaryEntry[];
  waterByDate: Readonly<Record<string, number>>;
  waterGoalMl: number;
  /** Null when no protein goal is set: then protein never counts. */
  proteinGoalG: number | null;
  weighInDates: readonly string[];
  categoryOf: (foodId: string) => FoodCategory | undefined;
};

const VEG_CATEGORIES: readonly FoodCategory[] = ['produce', 'fruit'];

export function buildDays(input: ActivityInput): Map<LocalDate, DayActivity> {
  const days = new Map<LocalDate, DayActivity>();
  const day = (date: LocalDate): DayActivity => {
    let d = days.get(date);
    if (!d) {
      d = {
        date,
        entries: 0,
        meals: [],
        recipes: [],
        vegEntries: 0,
        photoEntries: 0,
        waterReached: false,
        proteinReached: false,
        weighed: false,
      };
      days.set(date, d);
    }
    return d;
  };
  const protein = new Map<LocalDate, number>();
  for (const entry of input.entries) {
    const d = day(entry.date);
    d.entries += 1;
    if (!d.meals.includes(entry.meal)) d.meals.push(entry.meal);
    if (entry.basis.kind === 'recipe' && !d.recipes.includes(entry.basis.recipeId)) d.recipes.push(entry.basis.recipeId);
    if (entry.basis.kind === 'food') {
      const category = input.categoryOf(entry.basis.foodId);
      if (category && VEG_CATEGORIES.includes(category)) d.vegEntries += 1;
    }
    if (entry.estimate) d.photoEntries += 1;
    protein.set(entry.date, (protein.get(entry.date) ?? 0) + entryMacros(entry).proteinG);
  }
  if (input.proteinGoalG && input.proteinGoalG > 0) {
    for (const [date, grams] of protein) if (grams >= input.proteinGoalG) day(date).proteinReached = true;
  }
  for (const [date, ml] of Object.entries(input.waterByDate)) {
    if (ml >= input.waterGoalMl) day(date).waterReached = true;
  }
  for (const date of input.weighInDates) day(date).weighed = true;
  return days;
}

// ---------------------------------------------------------------------------
// XP and levels

export const XP = {
  loggedDay: 10,
  perMeal: 5,
  allMainMeals: 10,
  water: 10,
  protein: 10,
  recipe: 15,
  maxRecipesPerDay: 2,
  veggies: 10,
  weighIn: 5,
  newRecipe: 20,
  planAccepted: 25,
  planUnderBudget: 15,
  quest: 15,
  weeklyChallenge: 50,
  achievement: 25,
} as const;

const MAIN_MEALS: readonly DiaryMeal[] = ['breakfast', 'lunch', 'dinner'];
export const VEG_TARGET = 3;

export function dayXp(d: DayActivity): number {
  let xp = 0;
  if (d.entries > 0) xp += XP.loggedDay + Math.min(4, d.meals.length) * XP.perMeal;
  if (MAIN_MEALS.every((m) => d.meals.includes(m))) xp += XP.allMainMeals;
  if (d.waterReached) xp += XP.water;
  if (d.proteinReached) xp += XP.protein;
  xp += Math.min(XP.maxRecipesPerDay, d.recipes.length) * XP.recipe;
  if (d.vegEntries >= VEG_TARGET) xp += XP.veggies;
  if (d.weighed) xp += XP.weighIn;
  return xp;
}

/** Level n starts at 50 × n × (n − 1) XP: 0, 100, 300, 600, 1000, … */
export function levelStart(level: number): number {
  return 50 * level * (level - 1);
}

export type LevelInfo = { level: number; xpIntoLevel: number; xpForLevel: number; progress: number };

export function levelFor(xp: number): LevelInfo {
  let level = 1;
  while (xp >= levelStart(level + 1)) level++;
  const start = levelStart(level);
  const next = levelStart(level + 1);
  return { level, xpIntoLevel: xp - start, xpForLevel: next - start, progress: (xp - start) / (next - start) };
}

// ---------------------------------------------------------------------------
// Streak with freezes

export const MAX_FREEZES = 2;
/** A freeze is earned for every 7 days of streak. */
export const FREEZE_EVERY = 7;

export type Streak = {
  current: number;
  best: number;
  /** Freezes left. One missed day uses one automatically, so a single gap does not reset the streak. */
  freezes: number;
  /** Days bridged with a freeze. */
  frozenDays: LocalDate[];
  /** Nothing logged today yet: the streak still counts, today is not over. */
  todayPending: boolean;
};

export function computeStreak(loggedDates: ReadonlySet<LocalDate>, today: LocalDate): Streak {
  const sorted = [...loggedDates].filter((d) => d <= today).sort();
  if (sorted.length === 0) return { current: 0, best: 0, freezes: 0, frozenDays: [], todayPending: true };
  let current = 0;
  let best = 0;
  let freezes = 0;
  const frozenDays: LocalDate[] = [];
  for (let date = sorted[0]; date <= today; date = addDays(date, 1)) {
    if (loggedDates.has(date)) {
      current += 1;
      best = Math.max(best, current);
      if (current % FREEZE_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
    } else if (date === today) {
      // Today is not over yet.
    } else if (freezes > 0 && current > 0) {
      freezes -= 1;
      frozenDays.push(date);
    } else {
      current = 0;
    }
  }
  return { current, best, freezes, frozenDays, todayPending: !loggedDates.has(today) };
}

// ---------------------------------------------------------------------------
// Daily quests and weekly challenges

export type QuestId = 'logBreakfast' | 'threeMeals' | 'water' | 'protein' | 'veggies' | 'cookRecipe';
export type Quest = { id: QuestId; progress: number; target: number; done: boolean };

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Three quests a day, the same for the whole day, picked from the ones that make sense for the user. */
export function questIdsFor(date: LocalDate, hasProteinGoal: boolean): QuestId[] {
  const pool: QuestId[] = ['logBreakfast', 'threeMeals', 'water', 'veggies', 'cookRecipe'];
  if (hasProteinGoal) pool.push('protein');
  const order = [...pool].sort((a, b) => hash(date + a) - hash(date + b));
  return order.slice(0, 3);
}

export function questProgress(id: QuestId, d: DayActivity | undefined): Quest {
  const day: Pick<DayActivity, 'meals' | 'waterReached' | 'proteinReached' | 'vegEntries' | 'recipes'> = d ?? {
    meals: [],
    waterReached: false,
    proteinReached: false,
    vegEntries: 0,
    recipes: [],
  };
  switch (id) {
    case 'logBreakfast':
      return { id, progress: day.meals.includes('breakfast') ? 1 : 0, target: 1, done: day.meals.includes('breakfast') };
    case 'threeMeals': {
      const n = MAIN_MEALS.filter((m) => day.meals.includes(m)).length;
      return { id, progress: n, target: 3, done: n >= 3 };
    }
    case 'water':
      return { id, progress: day.waterReached ? 1 : 0, target: 1, done: day.waterReached };
    case 'protein':
      return { id, progress: day.proteinReached ? 1 : 0, target: 1, done: day.proteinReached };
    case 'veggies':
      return { id, progress: Math.min(VEG_TARGET, day.vegEntries), target: VEG_TARGET, done: day.vegEntries >= VEG_TARGET };
    case 'cookRecipe':
      return { id, progress: Math.min(1, day.recipes.length), target: 1, done: day.recipes.length > 0 };
  }
}

export type ChallengeId = 'logFiveDays' | 'waterFourDays' | 'cookThree' | 'veggieFourDays' | 'newRecipesTwo';
export type Challenge = { id: ChallengeId; progress: number; target: number; done: boolean; weekStart: LocalDate };

/** Monday of the date's week. */
export function weekStartOf(date: LocalDate): LocalDate {
  const weekday = (parseLocalDate(date).getDay() + 6) % 7;
  return addDays(date, -weekday);
}

const CHALLENGES: readonly ChallengeId[] = ['logFiveDays', 'waterFourDays', 'cookThree', 'veggieFourDays', 'newRecipesTwo'];

export function challengeIdFor(weekStart: LocalDate): ChallengeId {
  return CHALLENGES[hash(weekStart) % CHALLENGES.length];
}

export function challengeProgress(
  id: ChallengeId,
  weekStart: LocalDate,
  days: ReadonlyMap<LocalDate, DayActivity>,
  firstRecipeDates: ReadonlyMap<string, LocalDate>,
): Challenge {
  const week = Array.from({ length: 7 }, (_, i) => days.get(addDays(weekStart, i)));
  const count = (pick: (d: DayActivity) => boolean) => week.filter((d) => d && pick(d)).length;
  let progress: number;
  let target: number;
  switch (id) {
    case 'logFiveDays':
      progress = count((d) => d.entries > 0);
      target = 5;
      break;
    case 'waterFourDays':
      progress = count((d) => d.waterReached);
      target = 4;
      break;
    case 'cookThree':
      progress = count((d) => d.recipes.length > 0);
      target = 3;
      break;
    case 'veggieFourDays':
      progress = count((d) => d.vegEntries >= VEG_TARGET);
      target = 4;
      break;
    case 'newRecipesTwo': {
      const end = addDays(weekStart, 6);
      progress = [...firstRecipeDates.values()].filter((d) => d >= weekStart && d <= end).length;
      target = 2;
      break;
    }
  }
  return { id, progress: Math.min(progress, target), target, done: progress >= target, weekStart };
}

// ---------------------------------------------------------------------------
// Achievements

export type Tier = 'bronze' | 'silver' | 'gold';

export type Stats = {
  totalEntries: number;
  loggedDays: number;
  fullDays: number;
  bestStreak: number;
  waterDays: number;
  proteinDays: number;
  recipeDays: number;
  distinctRecipes: number;
  vegDays: number;
  weighIns: number;
  photoEntries: number;
  plansAccepted: number;
  plansUnderBudget: number;
  savedMeals: number;
  ownRecipes: number;
  barcodeFoods: number;
  questsDone: number;
  challengesDone: number;
  freezesUsed: number;
  level: number;
};

export type AchievementDef = {
  id: string;
  tier: Tier;
  icon: string;
  /** Stat and threshold that unlock it. */
  stat: keyof Stats;
  min: number;
};

/** 39 achievements; every one rewards a habit, none rewards eating less or losing weight. */
export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'firstLog', tier: 'bronze', icon: 'diary', stat: 'totalEntries', min: 1 },
  { id: 'fullDay', tier: 'bronze', icon: 'checkCircle', stat: 'fullDays', min: 1 },
  { id: 'fullDays10', tier: 'silver', icon: 'checkCircle', stat: 'fullDays', min: 10 },
  { id: 'streak3', tier: 'bronze', icon: 'flame', stat: 'bestStreak', min: 3 },
  { id: 'streak7', tier: 'bronze', icon: 'flame', stat: 'bestStreak', min: 7 },
  { id: 'streak14', tier: 'silver', icon: 'flame', stat: 'bestStreak', min: 14 },
  { id: 'streak30', tier: 'silver', icon: 'flame', stat: 'bestStreak', min: 30 },
  { id: 'streak100', tier: 'gold', icon: 'flame', stat: 'bestStreak', min: 100 },
  { id: 'days10', tier: 'bronze', icon: 'calendar', stat: 'loggedDays', min: 10 },
  { id: 'days50', tier: 'silver', icon: 'calendar', stat: 'loggedDays', min: 50 },
  { id: 'days100', tier: 'gold', icon: 'calendar', stat: 'loggedDays', min: 100 },
  { id: 'water1', tier: 'bronze', icon: 'water', stat: 'waterDays', min: 1 },
  { id: 'water7', tier: 'silver', icon: 'water', stat: 'waterDays', min: 7 },
  { id: 'water30', tier: 'gold', icon: 'water', stat: 'waterDays', min: 30 },
  { id: 'protein1', tier: 'bronze', icon: 'egg', stat: 'proteinDays', min: 1 },
  { id: 'protein10', tier: 'silver', icon: 'egg', stat: 'proteinDays', min: 10 },
  { id: 'protein30', tier: 'gold', icon: 'egg', stat: 'proteinDays', min: 30 },
  { id: 'cook1', tier: 'bronze', icon: 'chef', stat: 'recipeDays', min: 1 },
  { id: 'cook10', tier: 'silver', icon: 'chef', stat: 'recipeDays', min: 10 },
  { id: 'cook50', tier: 'gold', icon: 'chef', stat: 'recipeDays', min: 50 },
  { id: 'explorer5', tier: 'bronze', icon: 'sparkles', stat: 'distinctRecipes', min: 5 },
  { id: 'explorer20', tier: 'silver', icon: 'sparkles', stat: 'distinctRecipes', min: 20 },
  { id: 'veg7', tier: 'bronze', icon: 'salad', stat: 'vegDays', min: 7 },
  { id: 'veg30', tier: 'silver', icon: 'salad', stat: 'vegDays', min: 30 },
  { id: 'plan1', tier: 'bronze', icon: 'list', stat: 'plansAccepted', min: 1 },
  { id: 'plan5', tier: 'silver', icon: 'list', stat: 'plansAccepted', min: 5 },
  { id: 'budget1', tier: 'bronze', icon: 'savings', stat: 'plansUnderBudget', min: 1 },
  { id: 'budget5', tier: 'gold', icon: 'savings', stat: 'plansUnderBudget', min: 5 },
  { id: 'savedMeal', tier: 'bronze', icon: 'bookmark', stat: 'savedMeals', min: 1 },
  { id: 'ownRecipe', tier: 'bronze', icon: 'pot', stat: 'ownRecipes', min: 1 },
  { id: 'barcode', tier: 'bronze', icon: 'barcode', stat: 'barcodeFoods', min: 1 },
  { id: 'photo', tier: 'bronze', icon: 'camera', stat: 'photoEntries', min: 1 },
  { id: 'weighIns10', tier: 'bronze', icon: 'chart', stat: 'weighIns', min: 10 },
  { id: 'quests10', tier: 'silver', icon: 'target', stat: 'questsDone', min: 10 },
  { id: 'challenge1', tier: 'bronze', icon: 'trophy', stat: 'challengesDone', min: 1 },
  { id: 'challenge5', tier: 'gold', icon: 'trophy', stat: 'challengesDone', min: 5 },
  { id: 'comeback', tier: 'silver', icon: 'freeze', stat: 'freezesUsed', min: 1 },
  { id: 'level5', tier: 'silver', icon: 'star', stat: 'level', min: 5 },
  { id: 'level10', tier: 'gold', icon: 'crown', stat: 'level', min: 10 },
];

// ---------------------------------------------------------------------------
// Everything together

export type GameInput = ActivityInput & {
  today: LocalDate;
  plans: readonly { acceptedAt: string | null; underBudget: boolean }[];
  savedMeals: number;
  ownRecipes: number;
  barcodeFoods: number;
};

export type GameState = {
  xp: number;
  level: LevelInfo;
  streak: Streak;
  quests: Quest[];
  challenge: Challenge;
  unlocked: string[];
  stats: Stats;
};

export function computeGame(input: GameInput): GameState {
  const days = buildDays(input);
  const hasProteinGoal = Boolean(input.proteinGoalG && input.proteinGoalG > 0);

  // First day each recipe was logged ("new recipe").
  const firstRecipeDates = new Map<string, LocalDate>();
  for (const d of [...days.values()].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const id of d.recipes) if (!firstRecipeDates.has(id)) firstRecipeDates.set(id, d.date);
  }

  let xp = 0;
  let questsDone = 0;
  for (const d of days.values()) {
    if (d.date > input.today) continue;
    xp += dayXp(d);
    for (const id of questIdsFor(d.date, hasProteinGoal)) {
      if (questProgress(id, d).done) {
        questsDone += 1;
        xp += XP.quest;
      }
    }
  }
  xp += firstRecipeDates.size * XP.newRecipe;
  const plansAccepted = input.plans.filter((p) => p.acceptedAt).length;
  const plansUnderBudget = input.plans.filter((p) => p.acceptedAt && p.underBudget).length;
  xp += plansAccepted * XP.planAccepted + plansUnderBudget * XP.planUnderBudget;

  // Weekly challenges of finished and current weeks.
  let challengesDone = 0;
  const dates = [...days.keys()].sort();
  if (dates.length > 0) {
    for (let week = weekStartOf(dates[0]); week <= input.today; week = addDays(week, 7)) {
      if (challengeProgress(challengeIdFor(week), week, days, firstRecipeDates).done) {
        challengesDone += 1;
        xp += XP.weeklyChallenge;
      }
    }
  }

  const logged = new Set([...days.values()].filter((d) => d.entries > 0).map((d) => d.date));
  const streak = computeStreak(logged, input.today);
  const all = [...days.values()];
  const baseStats: Stats = {
    totalEntries: all.reduce((s, d) => s + d.entries, 0),
    loggedDays: logged.size,
    fullDays: all.filter((d) => MAIN_MEALS.every((m) => d.meals.includes(m))).length,
    bestStreak: streak.best,
    waterDays: all.filter((d) => d.waterReached).length,
    proteinDays: all.filter((d) => d.proteinReached).length,
    recipeDays: all.filter((d) => d.recipes.length > 0).length,
    distinctRecipes: firstRecipeDates.size,
    vegDays: all.filter((d) => d.vegEntries >= VEG_TARGET).length,
    weighIns: all.filter((d) => d.weighed).length,
    photoEntries: all.reduce((s, d) => s + d.photoEntries, 0),
    plansAccepted,
    plansUnderBudget,
    savedMeals: input.savedMeals,
    ownRecipes: input.ownRecipes,
    barcodeFoods: input.barcodeFoods,
    questsDone,
    challengesDone,
    freezesUsed: streak.frozenDays.length,
    level: 1,
  };

  // Achievements add XP, which can raise the level, which can unlock level achievements.
  let unlocked: string[] = [];
  let stats = baseStats;
  for (let pass = 0; pass < 3; pass++) {
    const total = xp + unlocked.length * XP.achievement;
    stats = { ...baseStats, level: levelFor(total).level };
    const next = ACHIEVEMENTS.filter((a) => stats[a.stat] >= a.min).map((a) => a.id);
    if (next.length === unlocked.length) break;
    unlocked = next;
  }
  const totalXp = xp + unlocked.length * XP.achievement;

  const todayActivity = days.get(input.today);
  const weekStart = weekStartOf(input.today);
  return {
    xp: totalXp,
    level: levelFor(totalXp),
    streak,
    quests: questIdsFor(input.today, hasProteinGoal).map((id) => questProgress(id, todayActivity)),
    challenge: challengeProgress(challengeIdFor(weekStart), weekStart, days, firstRecipeDates),
    unlocked,
    stats,
  };
}
