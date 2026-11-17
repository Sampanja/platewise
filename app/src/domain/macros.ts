import type { DiaryMeal, Macros } from '@/data/types';

import type { GoalType } from './energy';

/**
 * Macro targets: eating styles with preset macros, a protein level in g/kg,
 * hand adjustment in percent or grams with locks, sanity warnings, and the
 * optional split of the day's targets over meals. Pure and unit tested.
 *
 * Energy factors: protein and carbohydrates 4 kcal/g, fat 9 kcal/g.
 */

export const KCAL_PER_G = { proteinG: 4, carbsG: 4, fatG: 9 } as const;
export type MacroKey = keyof typeof KCAL_PER_G;
export const MACRO_KEYS: readonly MacroKey[] = ['proteinG', 'carbsG', 'fatG'];

// ── Eating styles ───────────────────────────────────────────────────────────

export const DIET_STYLES = [
  'balanced',
  'highProtein',
  'muscleGain',
  'endurance',
  'mediterranean',
  'lowCarb',
  'keto',
  'vegetarian',
  'vegan',
  'custom',
] as const;
export type DietStyle = (typeof DIET_STYLES)[number];

export function isDietStyle(value: unknown): value is DietStyle {
  return (DIET_STYLES as readonly unknown[]).includes(value);
}

/**
 * How each style splits the energy left after protein. Fat is a share of the
 * whole day's energy; carbohydrates get the rest unless the style caps them.
 */
type StylePreset = {
  /** Fat as a share of energy. */
  fatShare: number;
  /** Carbohydrates as a share of energy (fat then gets the rest). */
  carbShare?: number;
  /** Lower bound for carbohydrates in grams when capped. */
  carbMinG?: number;
  /** Upper bound for carbohydrates in grams (ketogenic). */
  carbMaxG?: number;
  /** Protein level the style suggests (unless the user picks one). */
  protein?: ProteinLevel;
  /** Plant protein is a little less digestible: +10 %. */
  plant?: boolean;
};

export const STYLE_PRESETS: Record<Exclude<DietStyle, 'custom'>, StylePreset> = {
  balanced: { fatShare: 0.3 },
  highProtein: { fatShare: 0.3, protein: 'high' },
  muscleGain: { fatShare: 0.25, protein: 'high' },
  endurance: { fatShare: 0.25, carbShare: 0.55, protein: 'moderate' },
  mediterranean: { fatShare: 0.38 },
  lowCarb: { fatShare: 0, carbShare: 0.25, carbMinG: 100 },
  keto: { fatShare: 0, carbShare: 0.05, carbMaxG: 30, protein: 'moderate' },
  vegetarian: { fatShare: 0.3, plant: true },
  vegan: { fatShare: 0.3, plant: true },
};

// ── Protein ─────────────────────────────────────────────────────────────────

export const PROTEIN_LEVELS = ['base', 'moderate', 'high'] as const;
export type ProteinLevel = (typeof PROTEIN_LEVELS)[number];
/** g per kg of reference weight. Base is a little above the NNR minimum (0.83). */
export const PROTEIN_G_PER_KG_LEVEL: Record<ProteinLevel, number> = { base: 1.0, moderate: 1.4, high: 1.8 };
/** Above this (g/kg of body weight) a warning is shown. */
export const PROTEIN_WARN_G_PER_KG = 2.2;
/** Fat under this share of energy gets a warning (hormones, fat-soluble vitamins). */
export const FAT_WARN_SHARE = 0.2;

export function isProteinLevel(value: unknown): value is ProteinLevel {
  return (PROTEIN_LEVELS as readonly unknown[]).includes(value);
}

/**
 * The protein level suggested for a goal and style: higher when losing
 * weight (keeps muscle), gaining muscle or recomposing; the style's own
 * suggestion otherwise.
 */
export function suggestedProteinLevel(goal: GoalType, style: DietStyle): ProteinLevel {
  if (goal === 'lose' || goal === 'gain' || goal === 'recomp') return 'high';
  if (style !== 'custom' && STYLE_PRESETS[style].protein) return STYLE_PRESETS[style].protein;
  return 'moderate';
}

/** Body weight capped at the weight of BMI 25, so protein does not balloon with high body weight. */
export function referenceWeight(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.min(weightKg, 25 * m * m);
}

const round5 = (value: number) => Math.max(0, Math.round(value / 5) * 5);

/**
 * Macro targets for a calorie target from a style and protein level.
 * Protein first (g/kg of reference weight), then the style's carbohydrate
 * and fat split of the rest. Protein is trimmed if it would push fat under
 * 20 % or carbohydrates under the style's floor.
 */
export function styleMacros(
  kcal: number,
  style: Exclude<DietStyle, 'custom'>,
  level: ProteinLevel,
  weightKg: number,
  heightCm: number,
): Macros {
  const preset = STYLE_PRESETS[style];
  let proteinG = PROTEIN_G_PER_KG_LEVEL[level] * referenceWeight(weightKg, heightCm) * (preset.plant ? 1.1 : 1);
  let carbsG: number;
  let fatG: number;
  if (preset.carbShare !== undefined && preset.fatShare === 0) {
    // Carbohydrates fixed (low-carb, keto); fat gets the rest.
    carbsG = (kcal * preset.carbShare) / 4;
    if (preset.carbMinG !== undefined) carbsG = Math.max(preset.carbMinG, carbsG);
    if (preset.carbMaxG !== undefined) carbsG = Math.min(preset.carbMaxG, carbsG);
    const maxProteinKcal = kcal - carbsG * 4 - kcal * FAT_WARN_SHARE;
    proteinG = Math.min(proteinG, Math.max(0, maxProteinKcal / 4));
    fatG = Math.max(0, (kcal - proteinG * 4 - carbsG * 4) / 9);
  } else {
    fatG = (kcal * preset.fatShare) / 9;
    const minCarbShare = preset.carbShare ?? 0.3;
    const maxProteinKcal = kcal * (1 - preset.fatShare - minCarbShare);
    proteinG = Math.min(proteinG, Math.max(0, maxProteinKcal / 4));
    carbsG = Math.max(0, (kcal - proteinG * 4 - fatG * 9) / 4);
  }
  return { kcal: Math.round(kcal), proteinG: round5(proteinG), carbsG: round5(carbsG), fatG: round5(fatG) };
}

// ── Hand adjustment ─────────────────────────────────────────────────────────

export const MACRO_INPUTS = ['percent', 'grams'] as const;
export type MacroInput = (typeof MACRO_INPUTS)[number];

export function macroKcal(macros: Pick<Macros, MacroKey>): number {
  return MACRO_KEYS.reduce((sum, key) => sum + macros[key] * KCAL_PER_G[key], 0);
}

/** Share of energy of each macro (0–1), from grams. */
export function macroShares(macros: Pick<Macros, MacroKey>): Record<MacroKey, number> {
  const total = macroKcal(macros) || 1;
  return {
    proteinG: (macros.proteinG * KCAL_PER_G.proteinG) / total,
    carbsG: (macros.carbsG * KCAL_PER_G.carbsG) / total,
    fatG: (macros.fatG * KCAL_PER_G.fatG) / total,
  };
}

/** Grams of a macro for a share of the day's energy. */
export function gramsForShare(key: MacroKey, share: number, kcal: number): number {
  return (share * kcal) / KCAL_PER_G[key];
}

/**
 * Sets one macro and lets the others adapt so the day's energy stays the
 * same. Unlocked macros share the change in proportion to their energy; locked
 * ones never move. If nothing else can move, the change is limited to what
 * keeps the total. Grams are whole numbers.
 */
export function adjustMacro(
  current: Macros,
  key: MacroKey,
  grams: number,
  locked: readonly MacroKey[] = [],
): Macros {
  const kcal = current.kcal;
  const others = MACRO_KEYS.filter((k) => k !== key);
  const free = others.filter((k) => !locked.includes(k));
  const lockedKcal = others.filter((k) => locked.includes(k)).reduce((sum, k) => sum + current[k] * KCAL_PER_G[k], 0);
  const room = Math.max(0, kcal - lockedKcal);
  const wanted = Math.max(0, grams) * KCAL_PER_G[key];
  // With every other macro locked, the changed one fills exactly what is left.
  const setKcal = free.length === 0 ? room : Math.min(wanted, room);
  const left = room - setKcal;
  const freeKcal = free.reduce((sum, k) => sum + current[k] * KCAL_PER_G[k], 0);
  const next: Macros = { ...current, [key]: Math.round(setKcal / KCAL_PER_G[key]) };
  for (const k of free) {
    const weight = freeKcal > 0 ? (current[k] * KCAL_PER_G[k]) / freeKcal : 1 / free.length;
    next[k] = Math.max(0, Math.round((left * weight) / KCAL_PER_G[k]));
  }
  return next;
}

/** Scales hand-set macros to a new calorie target, keeping their shares. */
export function scaleMacros(macros: Macros, kcal: number): Macros {
  const total = macroKcal(macros);
  if (total <= 0) return { ...macros, kcal };
  const factor = kcal / total;
  return {
    ...macros,
    kcal: Math.round(kcal),
    proteinG: Math.round(macros.proteinG * factor),
    carbsG: Math.round(macros.carbsG * factor),
    fatG: Math.round(macros.fatG * factor),
  };
}

export type MacroWarning = 'fatLow' | 'proteinHigh' | 'keto';

/** Friendly warnings about the targets; never blocking. */
export function macroWarnings(macros: Macros, weightKg: number, style: DietStyle): MacroWarning[] {
  const out: MacroWarning[] = [];
  if (style === 'keto') out.push('keto');
  if (macroShares(macros).fatG < FAT_WARN_SHARE - 0.005) out.push('fatLow');
  if (weightKg > 0 && macros.proteinG / weightKg > PROTEIN_WARN_G_PER_KG) out.push('proteinHigh');
  return out;
}

// ── Meals ───────────────────────────────────────────────────────────────────

export const MEAL_COUNTS = [2, 3, 4, 5, 6] as const;
export type MealCount = (typeof MEAL_COUNTS)[number];
export const MEAL_DISTRIBUTIONS = ['even', 'bigBreakfast', 'bigDinner'] as const;
export type MealDistribution = (typeof MEAL_DISTRIBUTIONS)[number];

export type MealPlan = { enabled: boolean; count: MealCount; distribution: MealDistribution };
export const DEFAULT_MEAL_PLAN: MealPlan = { enabled: false, count: 3, distribution: 'even' };

/** Which diary meals a day of N meals has (snacks go to the snack bucket). */
const MEALS_FOR_COUNT: Record<MealCount, readonly DiaryMeal[]> = {
  2: ['breakfast', 'dinner'],
  3: ['breakfast', 'lunch', 'dinner'],
  4: ['breakfast', 'lunch', 'dinner', 'snack'],
  5: ['breakfast', 'lunch', 'snack', 'dinner', 'snack'],
  6: ['breakfast', 'snack', 'lunch', 'snack', 'dinner', 'snack'],
};

/** Weight of one eating occasion: main meals 1; snacks half unless the split is even; the big meal 1.6. */
function occasionWeight(meal: DiaryMeal, distribution: MealDistribution): number {
  if (distribution === 'even') return 1;
  if (meal === 'snack') return 0.5;
  if (distribution === 'bigBreakfast' && meal === 'breakfast') return 1.6;
  if (distribution === 'bigDinner' && meal === 'dinner') return 1.6;
  return 1;
}

export type MealTarget = { meal: DiaryMeal; occasions: number; share: number; kcal: number };

/**
 * The day's energy over the diary's meals. Shares add up to 1 and the kcal
 * to the day's target exactly (the rounding remainder goes to the largest).
 */
export function mealTargets(kcal: number, plan: Pick<MealPlan, 'count' | 'distribution'>): MealTarget[] {
  const occasions = MEALS_FOR_COUNT[plan.count];
  const weights = occasions.map((meal) => occasionWeight(meal, plan.distribution));
  const total = weights.reduce((a, b) => a + b, 0);
  const byMeal = new Map<DiaryMeal, { occasions: number; share: number }>();
  occasions.forEach((meal, i) => {
    const entry = byMeal.get(meal) ?? { occasions: 0, share: 0 };
    byMeal.set(meal, { occasions: entry.occasions + 1, share: entry.share + weights[i] / total });
  });
  const order: DiaryMeal[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const targets = order
    .filter((meal) => byMeal.has(meal))
    .map((meal) => {
      const { occasions: n, share } = byMeal.get(meal)!;
      return { meal, occasions: n, share, kcal: Math.round((kcal * share) / 10) * 10 };
    });
  const diff = Math.round(kcal) - targets.reduce((sum, t) => sum + t.kcal, 0);
  if (diff !== 0 && targets.length > 0) {
    const largest = targets.reduce((best, t) => (t.share > best.share ? t : best), targets[0]);
    largest.kcal += diff;
  }
  return targets;
}

export function isMealPlan(value: unknown): value is MealPlan {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.enabled === 'boolean' &&
    (MEAL_COUNTS as readonly unknown[]).includes(v.count) &&
    (MEAL_DISTRIBUTIONS as readonly unknown[]).includes(v.distribution)
  );
}

/** Old saved styles: "plant" became vegetarian; hand-set macros are the custom style. */
export function migrateDietStyle(value: unknown, manualMacros: boolean): DietStyle {
  if (manualMacros) return 'custom';
  if (value === 'plant') return 'vegetarian';
  return isDietStyle(value) ? value : 'balanced';
}
