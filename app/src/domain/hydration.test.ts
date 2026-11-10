import { describe, expect, it } from '@jest/globals';

import {
  byDrink,
  dayParts,
  isAboveCaution,
  manualWaterGoal,
  MAX_GOAL_ML,
  MIN_GOAL_ML,
  recommendedWaterGoal,
  reminderHours,
  roomLeft,
  totalOn,
  totalsByDate,
  waterStreak,
  type HydrationProfile,
  type WaterEntry,
} from './hydration';

const person = (patch: Partial<HydrationProfile> = {}): HydrationProfile => ({
  weightKg: null,
  sex: null,
  activity: 2,
  pregnancy: 'none',
  ...patch,
});

describe('recommendedWaterGoal', () => {
  it('uses 1.5 l when nothing is known', () => {
    const goal = recommendedWaterGoal(person());
    expect(goal.totalMl).toBe(1500);
    expect(goal.basis).toBe('default');
  });

  it('uses EFSA drinks by sex when weight is unknown', () => {
    expect(recommendedWaterGoal(person({ sex: 'female' })).totalMl).toBe(1600);
    expect(recommendedWaterGoal(person({ sex: 'male' })).totalMl).toBe(2000);
  });

  it('scales with body weight (24 ml/kg of drinks) within sensible limits', () => {
    expect(recommendedWaterGoal(person({ weightKg: 70 })).totalMl).toBe(1700);
    expect(recommendedWaterGoal(person({ weightKg: 40 })).totalMl).toBe(1200);
    expect(recommendedWaterGoal(person({ weightKg: 160 })).totalMl).toBe(2600);
    expect(recommendedWaterGoal(person({ weightKg: 70 })).basis).toBe('weight');
  });

  it('adds for very active everyday life, pregnancy and breastfeeding', () => {
    const base = recommendedWaterGoal(person({ sex: 'female' })).totalMl;
    expect(recommendedWaterGoal(person({ sex: 'female', activity: 5 })).totalMl).toBe(base + 500);
    expect(recommendedWaterGoal(person({ sex: 'female', pregnancy: 'pregnant' })).totalMl).toBe(base + 300);
    expect(recommendedWaterGoal(person({ sex: 'female', pregnancy: 'breastfeeding' })).totalMl).toBe(base + 700);
  });

  it('adds exercise (500 ml per hour, at most 1.5 l) and heat for the day', () => {
    expect(dayParts({ exerciseMin: 30, hot: false })).toEqual([{ key: 'exercise', ml: 250 }]);
    expect(dayParts({ exerciseMin: 600, hot: true })).toEqual([
      { key: 'exercise', ml: 1500 },
      { key: 'heat', ml: 500 },
    ]);
    const goal = recommendedWaterGoal(person({ weightKg: 70 }), { exerciseMin: 60, hot: true });
    expect(goal.totalMl).toBe(1700 + 500 + 500);
    expect(goal.parts.map((p) => p.key)).toEqual(['base', 'exercise', 'heat']);
  });

  it('never goes above 4 litres, whatever the inputs', () => {
    const goal = recommendedWaterGoal(person({ weightKg: 200, activity: 5, pregnancy: 'breastfeeding' }), {
      exerciseMin: 900,
      hot: true,
    });
    expect(goal.totalMl).toBe(MAX_GOAL_ML);
  });
});

describe('manualWaterGoal', () => {
  it('keeps the own number within limits and still adds the day', () => {
    expect(manualWaterGoal(2200).totalMl).toBe(2200);
    expect(manualWaterGoal(300).totalMl).toBe(MIN_GOAL_ML);
    expect(manualWaterGoal(9000).totalMl).toBe(MAX_GOAL_ML);
    expect(manualWaterGoal(2000, { exerciseMin: 60, hot: false }).totalMl).toBe(2500);
  });
});

const entries: WaterEntry[] = [
  { id: '1', date: '2026-11-09', time: '08:00', ml: 250, drink: 'water' },
  { id: '2', date: '2026-11-09', time: '09:00', ml: 200, drink: 'coffee' },
  { id: '3', date: '2026-11-09', time: '12:00', ml: 500, drink: 'water' },
  { id: '4', date: '2026-11-10', time: '08:00', ml: 330, drink: 'sparkling' },
];

describe('totals', () => {
  it('sums per day and per drink', () => {
    expect(totalOn(entries, '2026-11-09')).toBe(950);
    expect(totalsByDate(entries)).toEqual({ '2026-11-09': 950, '2026-11-10': 330 });
    expect(byDrink(entries, '2026-11-09')).toEqual([
      { drink: 'water', ml: 750 },
      { drink: 'coffee', ml: 200 },
    ]);
  });

  it('guards against typos and cautions calmly above 4 litres', () => {
    expect(roomLeft(entries, '2026-11-09')).toBe(8000 - 950);
    expect(isAboveCaution(4000)).toBe(false);
    expect(isAboveCaution(4100)).toBe(true);
  });
});

describe('waterStreak', () => {
  const prev = (date: string) => {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const goal = () => 1500;

  it('counts days reached in a row; an unfinished today does not break it', () => {
    const totals = { '2026-11-07': 1600, '2026-11-08': 1500, '2026-11-09': 2000, '2026-11-10': 300 };
    expect(waterStreak(totals, goal, '2026-11-10', prev)).toBe(3);
    expect(waterStreak({ ...totals, '2026-11-10': 1500 }, goal, '2026-11-10', prev)).toBe(4);
    expect(waterStreak({ '2026-11-08': 1500 }, goal, '2026-11-10', prev)).toBe(0);
  });

  it('uses the goal of each day', () => {
    const totals = { '2026-11-09': 1800, '2026-11-10': 1800 };
    const goals = (date: string) => (date === '2026-11-09' ? 2200 : 1500);
    expect(waterStreak(totals, goals, '2026-11-10', prev)).toBe(1);
  });
});

describe('reminderHours', () => {
  it('spreads reminders evenly over the waking day', () => {
    expect(reminderHours(9, 21, 2)).toEqual([9, 11, 13, 15, 17, 19, 21]);
    expect(reminderHours(10, 16, 3)).toEqual([10, 13, 16]);
    expect(reminderHours(22, 8, 2)).toEqual([]);
  });
});
