import { describe, expect, it } from '@jest/globals';

import { FOODS_BY_ID, RECIPES } from '@/data/catalog';
import { foodQuality, recipeQuality } from '@/data/catalog/quality';

import { combine, explain, gradeFor, isBetterGrade, parseNutriScore, qualityScore } from './qualityScore';

const base = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

describe('qualityScore', () => {
  it('maps points to grades like Nutri-Score for foods', () => {
    expect(gradeFor(-5)).toBe('A');
    expect(gradeFor(0)).toBe('B');
    expect(gradeFor(2)).toBe('B');
    expect(gradeFor(3)).toBe('C');
    expect(gradeFor(11)).toBe('D');
    expect(gradeFor(19)).toBe('E');
  });

  it('gives vegetables an A and sweets an E', () => {
    const broccoli = qualityScore({ per100g: { ...base, kcal: 35, proteinG: 3, fiberG: 3, sugarG: 1.5, saltG: 0.05, satFatG: 0.1 }, fruitVegPct: 100 });
    const candy = qualityScore({ per100g: { ...base, kcal: 380, proteinG: 0, fiberG: 0, sugarG: 60, saltG: 0.1, satFatG: 10 }, fruitVegPct: 0 });
    expect(broccoli.grade).toBe('A');
    expect(candy.grade).toBe('E');
  });

  it('lets fibre, protein and vegetables raise the score', () => {
    const plain = qualityScore({ per100g: { ...base, kcal: 150, proteinG: 2, fiberG: 0, sugarG: 2, saltG: 0.5, satFatG: 2 }, fruitVegPct: 0 });
    const better = qualityScore({ per100g: { ...base, kcal: 150, proteinG: 9, fiberG: 5, sugarG: 2, saltG: 0.5, satFatG: 2 }, fruitVegPct: 90 });
    expect(better.points).toBeLessThan(plain.points);
    expect(isBetterGrade(better.grade, plain.grade) || better.grade === plain.grade).toBe(true);
  });

  it('ignores protein for foods high in the negative nutrients (as Nutri-Score)', () => {
    const cheese = qualityScore({ per100g: { ...base, kcal: 350, proteinG: 25, sugarG: 0, saltG: 1.6, satFatG: 17 }, fruitVegPct: 0 });
    expect(cheese.parts.find((p) => p.key === 'protein')?.points).toBe(0);
  });

  it('treats water as A and sugary drinks strictly', () => {
    expect(qualityScore({ per100g: base, fruitVegPct: 0, drink: true, water: true }).grade).toBe('A');
    const soda = qualityScore({ per100g: { ...base, kcal: 42, sugarG: 10.5 }, fruitVegPct: 0, drink: true });
    expect(['D', 'E']).toContain(soda.grade);
  });

  it('explains what lowers and raises the score', () => {
    const score = qualityScore({ per100g: { ...base, kcal: 300, proteinG: 10, fiberG: 6, sugarG: 1, saltG: 2, satFatG: 1 }, fruitVegPct: 0 });
    const why = explain(score);
    expect(why.lowers.map((p) => p.key)).toContain('salt');
    expect(why.raises.map((p) => p.key)).toContain('fiber');
  });

  it('mixes foods by weight', () => {
    const mix = combine([
      { grams: 100, per100g: { ...base, kcal: 100, saltG: 1 }, fruitVegPct: 100 },
      { grams: 300, per100g: { ...base, kcal: 200, saltG: 0 }, fruitVegPct: 0 },
    ]);
    expect(mix?.per100g.kcal).toBe(175);
    expect(mix?.per100g.saltG).toBe(0.25);
    expect(mix?.fruitVegPct).toBe(25);
    expect(combine([])).toBeNull();
  });

  it('reads Open Food Facts Nutri-Score letters', () => {
    expect(parseNutriScore('b')).toBe('B');
    expect(parseNutriScore('unknown')).toBeNull();
    expect(parseNutriScore(undefined)).toBeNull();
  });
});

describe('catalog quality', () => {
  it('scores every library recipe', () => {
    for (const recipe of RECIPES) expect(recipeQuality(recipe)?.grade).toMatch(/^[A-E]$/);
  });

  it('gives sensible grades to familiar foods', () => {
    expect(foodQuality(FOODS_BY_ID.broccoli).grade).toBe('A');
    expect(['D', 'E']).toContain(foodQuality(FOODS_BY_ID['milk-chocolate']).grade);
    expect(foodQuality(FOODS_BY_ID.tea).grade).toBe('A');
  });
});

