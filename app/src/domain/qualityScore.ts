import type { Macros } from '@/data/types';

/**
 * PlatePal's food quality score A–E (docs/QUALITY_SCORE.md). Built on the
 * principles of Nutri-Score: points per 100 g for energy, sugars, saturated
 * fat and salt (they lower the score) and fibre, protein and the share of
 * vegetables, fruit, pulses and nuts (they raise it). Our own calculation,
 * not the official Nutri-Score; Open Food Facts' Nutri-Score is shown as is
 * for packaged products. Pure and unit tested (qualityScore.test.ts).
 *
 * The score describes a food, never the person: no red, no "bad". Missing
 * values count as zero points, and the explanation says which values were known.
 */

export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export const QUALITY_GRADES: readonly QualityGrade[] = ['A', 'B', 'C', 'D', 'E'];

export type QualityInput = {
  /** Nutrients per 100 g (or 100 ml for drinks). */
  per100g: Macros;
  /** Share of vegetables, fruit, berries, pulses and nuts, 0–100 %. */
  fruitVegPct: number;
  /** Drinks use their own, stricter energy and sugar scales. */
  drink?: boolean;
  /** Plain water, unsweetened tea or coffee: always A. */
  water?: boolean;
};

export type QualityPart = {
  key: 'energy' | 'sugar' | 'satFat' | 'salt' | 'fiber' | 'protein' | 'fruitVeg';
  points: number;
  max: number;
  /** Lowers (negative component) or raises (positive component) the score. */
  direction: 'lowers' | 'raises';
};

export type QualityScore = {
  grade: QualityGrade;
  /** Negative points minus positive points; lower is better. */
  points: number;
  parts: QualityPart[];
};

/** Points for a value: how many thresholds it exceeds. */
function steps(value: number, thresholds: readonly number[]): number {
  let points = 0;
  for (const limit of thresholds) if (value > limit) points += 1;
  return points;
}

const ENERGY_KJ = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const SUGAR_G = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];
const SAT_FAT_G = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SALT_G = [0.225, 0.45, 0.675, 0.9, 1.125, 1.35, 1.575, 1.8, 2.025, 2.25];
const FIBER_G = [0.9, 1.9, 2.8, 3.7, 4.7];
const PROTEIN_G = [1.6, 3.2, 4.8, 6.4, 8.0];
/** Drinks: energy per 100 ml and sugars per 100 ml. */
const DRINK_ENERGY_KJ = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270];
const DRINK_SUGAR_G = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5];

function fruitVegPoints(pct: number, drink: boolean): number {
  if (drink) return pct > 80 ? 10 : pct > 60 ? 4 : pct > 40 ? 2 : 0;
  return pct > 80 ? 5 : pct > 60 ? 2 : pct > 40 ? 1 : 0;
}

export function gradeFor(points: number, drink = false): QualityGrade {
  if (drink) {
    if (points <= 1) return 'B';
    if (points <= 5) return 'C';
    if (points <= 9) return 'D';
    return 'E';
  }
  if (points <= -1) return 'A';
  if (points <= 2) return 'B';
  if (points <= 10) return 'C';
  if (points <= 18) return 'D';
  return 'E';
}

export function qualityScore({ per100g, fruitVegPct, drink = false, water = false }: QualityInput): QualityScore {
  const kj = per100g.kcal * 4.184;
  const energy = steps(kj, drink ? DRINK_ENERGY_KJ : ENERGY_KJ);
  const sugar = steps(per100g.sugarG ?? 0, drink ? DRINK_SUGAR_G : SUGAR_G);
  const satFat = steps(per100g.satFatG ?? 0, SAT_FAT_G);
  const salt = steps(per100g.saltG ?? 0, SALT_G);
  const fiber = steps(per100g.fiberG ?? 0, FIBER_G);
  const protein = steps(per100g.proteinG, PROTEIN_G);
  const fruitVeg = fruitVegPoints(Math.max(0, Math.min(100, fruitVegPct)), drink);
  const negative = energy + sugar + satFat + salt;
  // As in Nutri-Score: protein only counts when the food is not already high in
  // the negative nutrients, or when it is mostly vegetables and fruit.
  const countProtein = negative < 11 || fruitVeg >= 5;
  const positive = fiber + (countProtein ? protein : 0) + fruitVeg;
  const points = negative - positive;
  const parts: QualityPart[] = [
    { key: 'energy', points: energy, max: 10, direction: 'lowers' },
    { key: 'sugar', points: sugar, max: 10, direction: 'lowers' },
    { key: 'satFat', points: satFat, max: 10, direction: 'lowers' },
    { key: 'salt', points: salt, max: 10, direction: 'lowers' },
    { key: 'fiber', points: fiber, max: 5, direction: 'raises' },
    { key: 'protein', points: countProtein ? protein : 0, max: 5, direction: 'raises' },
    { key: 'fruitVeg', points: fruitVeg, max: drink ? 10 : 5, direction: 'raises' },
  ];
  return { grade: water ? 'A' : gradeFor(points, drink), points, parts };
}

/** Grams-weighted average of several foods, for a recipe serving or a whole day. */
export type WeightedFood = { grams: number; per100g: Macros; fruitVegPct: number };

export function combine(items: readonly WeightedFood[]): { per100g: Macros; fruitVegPct: number } | null {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.grams), 0);
  if (total <= 0) return null;
  const keys = ['kcal', 'proteinG', 'carbsG', 'fatG', 'fiberG', 'sugarG', 'saltG', 'satFatG'] as const;
  const per100g: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  for (const key of keys) {
    let sum = 0;
    let known = false;
    for (const item of items) {
      const value = item.per100g[key];
      if (value !== undefined) {
        known = true;
        sum += value * item.grams;
      }
    }
    if (known || key === 'kcal' || key === 'proteinG' || key === 'carbsG' || key === 'fatG') per100g[key] = sum / total;
  }
  const fruitVegPct = items.reduce((sum, item) => sum + item.fruitVegPct * item.grams, 0) / total;
  return { per100g, fruitVegPct };
}

/** Parts that lower the score most and raise it most, for "Miksi tämä arvio?". */
export function explain(score: QualityScore): { lowers: QualityPart[]; raises: QualityPart[] } {
  return {
    lowers: score.parts.filter((p) => p.direction === 'lowers' && p.points >= 3).sort((a, b) => b.points - a.points),
    raises: score.parts.filter((p) => p.direction === 'raises' && p.points >= 2).sort((a, b) => b.points - a.points),
  };
}

/** True when `a` is a better grade than `b`. */
export function isBetterGrade(a: QualityGrade, b: QualityGrade): boolean {
  return QUALITY_GRADES.indexOf(a) < QUALITY_GRADES.indexOf(b);
}

/** Open Food Facts' Nutri-Score letter, when a product has one. */
export function parseNutriScore(value: unknown): QualityGrade | null {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  return (QUALITY_GRADES as readonly string[]).includes(upper) ? (upper as QualityGrade) : null;
}
