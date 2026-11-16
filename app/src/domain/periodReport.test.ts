import { describe, expect, it } from '@jest/globals';

import type { CookedEntry, DiaryEntry } from '@/data/types';

import { periodFor, periodReport } from './periodReport';

const NOW = '2026-11-18'; // a Wednesday

function entry(date: string, kcal: number, proteinG = 20): DiaryEntry {
  return {
    id: `${date}-${kcal}`,
    date,
    meal: 'lunch',
    name: 'x',
    basis: { kind: 'food', foodId: 'x', per100g: { kcal, proteinG, carbsG: 10, fatG: 5, fiberG: 4 } },
    quantity: 100,
    estimate: false,
    createdAt: '',
  };
}

const base = {
  now: NOW,
  goals: { kcal: 2000, proteinG: 100, carbsG: 250, fatG: 70 },
  waterByDate: {},
  waterGoalMl: 2000,
  weights: [],
  cooked: [],
  plans: [],
  gradeOf: () => 'B' as const,
};

describe('periodFor', () => {
  it('finds the week from the chosen first weekday', () => {
    expect(periodFor('week', 0, NOW, 0)).toMatchObject({ start: '2026-11-16', end: '2026-11-22' });
    expect(periodFor('week', 1, NOW, 0).start).toBe('2026-11-09');
    // Sunday-first calendars.
    expect(periodFor('week', 0, NOW, 6).start).toBe('2026-11-15');
  });

  it('finds whole calendar months', () => {
    const month = periodFor('month', 0, NOW);
    expect(month).toMatchObject({ start: '2026-11-01', end: '2026-11-30' });
    expect(month.days).toHaveLength(30);
    expect(periodFor('month', 2, NOW).start).toBe('2026-09-01');
  });
});

describe('periodReport', () => {
  const period = periodFor('week', 0, NOW);

  it('averages logged days only', () => {
    const report = periodReport({ ...base, period, entries: [entry('2026-11-16', 1800), entry('2026-11-17', 2200)] });
    expect(report.loggedDays).toBe(2);
    expect(report.avg.kcal).toBe(2000);
    expect(report.elapsedDays).toBe(3);
    expect(report.nutrients.fiberG).toBe(4);
    expect(report.grades.B).toBe(2);
  });

  it('counts the longest logging streak', () => {
    const report = periodReport({
      ...base,
      period: periodFor('week', 1, NOW),
      now: NOW,
      entries: ['2026-11-09', '2026-11-10', '2026-11-12', '2026-11-13', '2026-11-14'].map((d) => entry(d, 1000)),
    });
    expect(report.longestStreak).toBe(3);
  });

  it('describes water, cooking, pantry use and weight trend', () => {
    const cooked: CookedEntry[] = [
      { id: 'c', date: '2026-11-17', recipeId: 'r1', servings: 2, usedFromPantry: [{ ingredientId: 'cream', grams: 100 }, { ingredientId: 'eggs', grams: 120 }] },
    ];
    const report = periodReport({
      ...base,
      period,
      entries: [],
      waterByDate: { '2026-11-16': 2100, '2026-11-17': 1500 },
      cooked,
      weights: [
        { date: '2026-11-16', kg: 80 },
        { date: '2026-11-18', kg: 79.4 },
      ],
    });
    expect(report.water.goalDays).toBe(1);
    expect(report.water.avgMl).toBe(1800);
    expect(report.cooked.count).toBe(1);
    expect(report.pantry).toEqual({ itemsUsed: 2, gramsUsed: 220 });
    expect(report.weight.changeKg).toBe(-0.3);
  });

  it('ignores future days and entries outside the period', () => {
    const report = periodReport({ ...base, period, entries: [entry('2026-11-20', 1000), entry('2026-11-10', 1000)] });
    expect(report.loggedDays).toBe(0);
  });
});
