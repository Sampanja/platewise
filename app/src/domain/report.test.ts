import { describe, expect, it } from '@jest/globals';

import type { DiaryEntry } from '@/data/types';

import { dayReport, energySplit, weekReport } from './report';

function food(date: string, meal: DiaryEntry['meal'], kcal: number, proteinG: number, withMicros = true): DiaryEntry {
  return {
    id: `${date}-${meal}-${kcal}`,
    date,
    meal,
    name: 'x',
    basis: {
      kind: 'food',
      foodId: 'x',
      per100g: { kcal, proteinG, carbsG: 10, fatG: 5, ...(withMicros ? { fiberG: 2, sugarG: 3, saltG: 0.5 } : {}) },
    },
    quantity: 100,
    estimate: false,
    createdAt: '',
  };
}

describe('energySplit', () => {
  it('splits energy 4/4/9 and adds up to 100 %', () => {
    const split = energySplit({ kcal: 0, proteinG: 25, carbsG: 50, fatG: 11.1 });
    expect(split.proteinPct + split.carbsPct + split.fatPct).toBe(100);
    expect(split.proteinPct).toBe(25);
    expect(split.fatPct).toBe(25);
  });
  it('is all zero for an empty day', () => {
    expect(energySplit({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })).toEqual({ proteinPct: 0, carbsPct: 0, fatPct: 0 });
  });
});

describe('dayReport', () => {
  it('sums by meal and counts entries without micronutrients', () => {
    const entries = [
      food('2026-11-09', 'breakfast', 300, 10),
      food('2026-11-09', 'dinner', 600, 40, false),
      food('2026-11-08', 'dinner', 999, 1),
    ];
    const report = dayReport(entries, '2026-11-09');
    expect(report.byMeal).toEqual({ breakfast: 300, lunch: 0, dinner: 600, snack: 0 });
    expect(report.totals.kcal).toBe(900);
    expect(report.totals.fiberG).toBe(2);
    expect(report.entriesWithoutMicros).toBe(1);
  });
});

describe('weekReport', () => {
  const goals = { kcal: 2000, proteinG: 100, carbsG: 200, fatG: 70 };
  it('averages over logged days only and counts habit days', () => {
    const entries = [
      food('2026-11-09', 'dinner', 2000, 110),
      food('2026-11-08', 'dinner', 1500, 60),
      food('2026-11-01', 'dinner', 5000, 0), // outside the week
    ];
    const report = weekReport(entries, '2026-11-09', goals, { '2026-11-09': 1500, '2026-11-07': 500 });
    expect(report.days).toHaveLength(7);
    expect(report.days[6].date).toBe('2026-11-09');
    expect(report.loggedDays).toBe(2);
    expect(report.avgKcal).toBe(1750);
    expect(report.proteinGoalDays).toBe(1);
    expect(report.onTargetDays).toBe(1);
    expect(report.avgWaterMl).toBe(1000);
  });
  it('is empty without entries', () => {
    const report = weekReport([], '2026-11-09', null);
    expect(report.loggedDays).toBe(0);
    expect(report.avgKcal).toBe(0);
  });
});
