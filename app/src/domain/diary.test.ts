import { describe, expect, it } from '@jest/globals';

import type { DiaryEntry } from '@/data/types';

import { entryMacros, mealForHour, sumEntries, weekKcal } from './diary';

const per100g = { kcal: 200, proteinG: 10, carbsG: 20, fatG: 5 };

function entry(date: string, quantity: number, kind: 'food' | 'recipe' = 'food'): DiaryEntry {
  return {
    id: `${date}-${quantity}`,
    date,
    meal: 'lunch',
    name: 'x',
    basis:
      kind === 'food'
        ? { kind: 'food', foodId: 'f', per100g }
        : { kind: 'recipe', recipeId: 'r', perServing: per100g },
    quantity,
    estimate: false,
    createdAt: '',
  };
}

describe('diary', () => {
  it('scales foods by grams and recipes by servings', () => {
    expect(entryMacros(entry('2026-11-08', 150)).kcal).toBe(300);
    expect(entryMacros(entry('2026-11-08', 1.5, 'recipe')).kcal).toBe(300);
  });

  it('sums a day', () => {
    expect(sumEntries([entry('d', 100), entry('d', 50)])).toEqual({
      kcal: 300,
      proteinG: 15,
      carbsG: 30,
      fatG: 7.5,
    });
  });

  it('returns seven days ending on the given date', () => {
    const week = weekKcal([entry('2026-11-08', 100), entry('2026-11-02', 100), entry('2026-11-01', 100)], '2026-11-08');
    expect(week.map((d) => d.date)).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
    ]);
    expect(week.map((d) => d.kcal)).toEqual([200, 0, 0, 0, 0, 0, 200]);
  });

  it('suggests a meal by time of day', () => {
    expect(mealForHour(7)).toBe('breakfast');
    expect(mealForHour(12)).toBe('lunch');
    expect(mealForHour(18)).toBe('dinner');
    expect(mealForHour(15)).toBe('snack');
  });
});
