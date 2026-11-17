import { describe, expect, it } from '@jest/globals';

import {
  adjustMacro,
  DIET_STYLES,
  FAT_WARN_SHARE,
  gramsForShare,
  macroKcal,
  macroShares,
  macroWarnings,
  mealTargets,
  MEAL_COUNTS,
  MEAL_DISTRIBUTIONS,
  migrateDietStyle,
  PROTEIN_G_PER_KG_LEVEL,
  referenceWeight,
  scaleMacros,
  styleMacros,
  suggestedProteinLevel,
} from './macros';

const KCAL = 2000;
const kcalOf = (m: { proteinG: number; carbsG: number; fatG: number }) => macroKcal(m);

describe('eating styles', () => {
  const styles = DIET_STYLES.filter((s) => s !== 'custom');

  it('adds up to the calorie target in every style (within rounding)', () => {
    for (const style of styles) {
      for (const level of ['base', 'moderate', 'high'] as const) {
        const m = styleMacros(KCAL, style, level, 70, 170);
        expect(Math.abs(kcalOf(m) - KCAL)).toBeLessThanOrEqual(60);
        expect(m.kcal).toBe(KCAL);
      }
    }
  });

  it('keeps fat at least 20 % of energy in every style', () => {
    for (const style of styles) {
      const shares = macroShares(styleMacros(KCAL, style, 'high', 90, 180));
      expect(shares.fatG).toBeGreaterThanOrEqual(FAT_WARN_SHARE - 0.02);
    }
  });

  it('shapes the split the way the style promises', () => {
    const balanced = macroShares(styleMacros(KCAL, 'balanced', 'moderate', 70, 170));
    const med = macroShares(styleMacros(KCAL, 'mediterranean', 'moderate', 70, 170));
    const endurance = macroShares(styleMacros(KCAL, 'endurance', 'moderate', 70, 170));
    const lowCarb = styleMacros(KCAL, 'lowCarb', 'moderate', 70, 170);
    const keto = styleMacros(KCAL, 'keto', 'moderate', 70, 170);
    expect(med.fatG).toBeGreaterThan(balanced.fatG);
    expect(endurance.carbsG).toBeGreaterThan(balanced.carbsG);
    expect(lowCarb.carbsG).toBeGreaterThanOrEqual(100);
    expect(lowCarb.carbsG).toBeLessThan(styleMacros(KCAL, 'balanced', 'moderate', 70, 170).carbsG);
    expect(keto.carbsG).toBeLessThanOrEqual(30);
    expect(macroShares(keto).fatG).toBeGreaterThan(0.6);
  });

  it('gives plant styles 10 % more protein', () => {
    const balanced = styleMacros(KCAL, 'balanced', 'moderate', 70, 170);
    const vegan = styleMacros(KCAL, 'vegan', 'moderate', 70, 170);
    expect(vegan.proteinG).toBeGreaterThan(balanced.proteinG);
  });
});

describe('protein level', () => {
  it('is g/kg of a reference weight capped at BMI 25', () => {
    expect(referenceWeight(70, 170)).toBe(70);
    expect(referenceWeight(120, 170)).toBeCloseTo(72.25, 2);
    const base = styleMacros(KCAL, 'balanced', 'base', 70, 170).proteinG;
    const high = styleMacros(KCAL, 'balanced', 'high', 70, 170).proteinG;
    expect(base).toBe(Math.round((PROTEIN_G_PER_KG_LEVEL.base * 70) / 5) * 5);
    expect(high).toBeGreaterThan(base);
  });

  it('suggests more protein when losing weight or building muscle', () => {
    expect(suggestedProteinLevel('lose', 'balanced')).toBe('high');
    expect(suggestedProteinLevel('gain', 'balanced')).toBe('high');
    expect(suggestedProteinLevel('recomp', 'balanced')).toBe('high');
    expect(suggestedProteinLevel('maintain', 'balanced')).toBe('moderate');
    expect(suggestedProteinLevel('maintain', 'highProtein')).toBe('high');
  });
});

describe('hand adjustment', () => {
  const start = { kcal: 2000, proteinG: 120, carbsG: 230, fatG: 67 };

  it('keeps the total when one macro changes', () => {
    const next = adjustMacro(start, 'proteinG', 150);
    expect(next.proteinG).toBe(150);
    expect(Math.abs(kcalOf(next) - kcalOf(start))).toBeLessThanOrEqual(10);
  });

  it('never moves a locked macro', () => {
    const next = adjustMacro(start, 'proteinG', 150, ['fatG']);
    expect(next.fatG).toBe(start.fatG);
    expect(next.carbsG).toBeLessThan(start.carbsG);
    expect(Math.abs(kcalOf(next) - kcalOf(start))).toBeLessThanOrEqual(10);
  });

  it('limits the change when everything else is locked', () => {
    const next = adjustMacro(start, 'proteinG', 300, ['fatG', 'carbsG']);
    expect(next.carbsG).toBe(start.carbsG);
    expect(next.fatG).toBe(start.fatG);
    expect(Math.abs(kcalOf(next) - 2000)).toBeLessThanOrEqual(4);
  });

  it('never goes below zero', () => {
    const next = adjustMacro(start, 'carbsG', 600);
    expect(next.proteinG).toBeGreaterThanOrEqual(0);
    expect(next.fatG).toBeGreaterThanOrEqual(0);
    expect(next.carbsG).toBe(500);
  });

  it('converts percentages to grams and scales to a new target', () => {
    expect(gramsForShare('fatG', 0.3, 1800)).toBe(60);
    expect(gramsForShare('proteinG', 0.25, 2000)).toBe(125);
    const scaled = scaleMacros(start, 2500);
    expect(scaled.kcal).toBe(2500);
    expect(macroShares(scaled).proteinG).toBeCloseTo(macroShares(start).proteinG, 2);
  });

  it('warns about too little fat, very much protein and keto', () => {
    expect(macroWarnings({ kcal: 2000, proteinG: 150, carbsG: 300, fatG: 30 }, 70, 'custom')).toContain('fatLow');
    expect(macroWarnings({ kcal: 2000, proteinG: 200, carbsG: 180, fatG: 60 }, 70, 'custom')).toContain('proteinHigh');
    expect(macroWarnings(styleMacros(KCAL, 'keto', 'moderate', 70, 170), 70, 'keto')).toEqual(['keto']);
    expect(macroWarnings(styleMacros(KCAL, 'balanced', 'moderate', 70, 170), 70, 'balanced')).toEqual([]);
  });
});

describe('meals', () => {
  it('splits the day exactly for every count and distribution', () => {
    for (const count of MEAL_COUNTS) {
      for (const distribution of MEAL_DISTRIBUTIONS) {
        const targets = mealTargets(2000, { count, distribution });
        expect(targets.reduce((sum, t) => sum + t.kcal, 0)).toBe(2000);
        expect(targets.reduce((sum, t) => sum + t.share, 0)).toBeCloseTo(1, 10);
        expect(targets.reduce((sum, t) => sum + t.occasions, 0)).toBe(count);
      }
    }
  });

  it('gives the big meal more', () => {
    const big = mealTargets(2000, { count: 3, distribution: 'bigDinner' });
    const dinner = big.find((t) => t.meal === 'dinner')!;
    const breakfast = big.find((t) => t.meal === 'breakfast')!;
    expect(dinner.kcal).toBeGreaterThan(breakfast.kcal);
    const even = mealTargets(1800, { count: 3, distribution: 'even' });
    expect(even.map((t) => t.kcal)).toEqual([600, 600, 600]);
  });

  it('puts extra eating occasions in the snack bucket', () => {
    const six = mealTargets(2000, { count: 6, distribution: 'even' });
    expect(six.find((t) => t.meal === 'snack')).toMatchObject({ occasions: 3, share: 0.5 });
    expect(mealTargets(2000, { count: 2, distribution: 'even' }).map((t) => t.meal)).toEqual(['breakfast', 'dinner']);
  });
});

describe('saved styles', () => {
  it('maps old styles and hand-set macros', () => {
    expect(migrateDietStyle('plant', false)).toBe('vegetarian');
    expect(migrateDietStyle('highProtein', false)).toBe('highProtein');
    expect(migrateDietStyle('balanced', true)).toBe('custom');
    expect(migrateDietStyle('carnivore', false)).toBe('balanced');
  });
});
