import { describe, expect, it } from '@jest/globals';

import type { DiaryEntry } from '@/data/types';

import {
  copyDayEntries,
  copyMealEntries,
  entryMacros,
  mealForHour,
  ownRecipeId,
  ownRecipePerServing,
  savedMealEntries,
  savedMealItems,
  sumEntries,
  weekKcal,
} from './diary';

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

describe('quick entries and copying', () => {
  it('counts a quick entry as calories only', () => {
    expect(entryMacros({ basis: { kind: 'quick' }, quantity: 300 })).toEqual({ kcal: 300, proteinG: 0, carbsG: 0, fatG: 0 });
  });

  it('copies one meal to another day without touching other meals', () => {
    const lunch = { ...entry('2026-11-08', 150), meal: 'lunch' as const };
    const dinner = { ...entry('2026-11-08', 200), meal: 'dinner' as const };
    const copies = copyMealEntries([lunch, dinner], { date: '2026-11-08', meal: 'lunch' }, { date: '2026-11-09', meal: 'lunch' });
    expect(copies).toEqual([
      { name: 'x', basis: lunch.basis, quantity: 150, estimate: false, date: '2026-11-09', meal: 'lunch' },
    ]);
  });
});

describe('own meals, recipes and day copies', () => {
  it('adds the typed macros of a quick entry', () => {
    expect(
      entryMacros({ basis: { kind: 'quick', macros: { proteinG: 20, carbsG: 30, fatG: 10 } }, quantity: 300 }),
    ).toEqual({ kcal: 300, proteinG: 20, carbsG: 30, fatG: 10 });
  });

  it('copies a whole day keeping every meal', () => {
    const lunch = { ...entry('2026-11-08', 150), meal: 'lunch' as const };
    const dinner = { ...entry('2026-11-08', 200), meal: 'dinner' as const };
    const other = entry('2026-11-07', 99);
    const copies = copyDayEntries([lunch, dinner, other], '2026-11-08', '2026-11-10');
    expect(copies.map((c) => [c.date, c.meal, c.quantity])).toEqual([
      ['2026-11-10', 'lunch', 150],
      ['2026-11-10', 'dinner', 200],
    ]);
  });

  it('turns a saved meal back into entries without the estimate mark', () => {
    const items = savedMealItems([{ ...entry('2026-11-08', 150), estimate: true }], '2026-11-08', 'lunch');
    const saved = { id: 's', name: 'Aamupala', items, createdAt: '' };
    const entries = savedMealEntries(saved, '2026-11-09', 'breakfast');
    expect(entries).toEqual([
      { name: 'x', basis: items[0].basis, quantity: 150, date: '2026-11-09', meal: 'breakfast', estimate: false },
    ]);
  });

  it('divides an own recipe into servings', () => {
    const perServing = ownRecipePerServing({
      servings: 4,
      ingredients: [
        { foodId: 'a', name: 'a', grams: 400, per100g: { kcal: 100, proteinG: 10, carbsG: 0, fatG: 5 } },
        { foodId: 'b', name: 'b', grams: 200, per100g: { kcal: 200, proteinG: 0, carbsG: 40, fatG: 0, fiberG: 4 } },
      ],
    });
    expect(perServing).toEqual({ kcal: 200, proteinG: 10, carbsG: 20, fatG: 5, fiberG: 2 });
    expect(ownRecipeId('abc')).toBe('own:abc');
  });
});
