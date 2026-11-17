import { describe, expect, it } from '@jest/globals';

import {
  activityFactor,
  adaptiveExpenditure,
  bmrKatch,
  bmrMifflin,
  cycleWeek,
  expenditure,
  forecastDate,
  KCAL_FLOOR,
  macroTargets,
  milestones,
  planEnergy,
  stepsFactor,
  tdee,
  weekdayOf,
  weightSlopePerDay,
  workoutKcalPerDay,
  type BodyInfo,
} from './energy';

const woman: BodyInfo = {
  sex: 'female',
  ageYears: 35,
  heightCm: 165,
  weightKg: 75,
  activity: 2,
  exercisePerWeek: 2,
  pregnancy: 'none',
};
const man: BodyInfo = { ...woman, sex: 'male', heightCm: 180, weightKg: 90 };

describe('precise expenditure', () => {
  it('uses Katch–McArdle when body fat is known', () => {
    const result = expenditure({ ...woman, bodyFatPct: 30 });
    expect(result.formula).toBe('katch');
    expect(result.bmr).toBeCloseTo(370 + 21.6 * 75 * 0.7, 5);
    expect(bmrKatch(80, 20)).toBeCloseTo(370 + 21.6 * 64, 5);
    // Out-of-range body fat falls back to Mifflin–St Jeor.
    expect(expenditure({ ...woman, bodyFatPct: 2 }).formula).toBe('mifflin');
  });

  it('takes everyday activity from steps when given', () => {
    expect(stepsFactor(3000)).toBe(1.2);
    expect(stepsFactor(8000)).toBe(1.4);
    expect(stepsFactor(15000)).toBe(1.6);
    expect(expenditure({ ...woman, steps: 11000, exercisePerWeek: 0 }).everydayFactor).toBe(1.5);
  });

  it('adds workouts by type, frequency and duration (net MET)', () => {
    // 3 × 60 min gym for 75 kg: (5 − 1) × 75 × 1 h × 3 / 7 ≈ 128.6 kcal/day.
    expect(workoutKcalPerDay([{ type: 'gym', perWeek: 3, minutes: 60, intensity: 'moderate' }], 75)).toBeCloseTo(128.57, 1);
    const result = expenditure({ ...woman, workouts: [{ type: 'run', perWeek: 2, minutes: 30, intensity: 'moderate' }] });
    expect(result.tdee).toBeCloseTo(result.bmr * result.everydayFactor + result.exerciseKcal, 5);
    expect(result.exerciseKcal).toBeCloseTo(((9 - 1) * 75 * 0.5 * 2) / 7, 5);
  });

  it('keeps the old session-based factor when no workouts are listed', () => {
    expect(tdee(woman)).toBeCloseTo(bmrMifflin(woman) * activityFactor(2, 2), 5);
  });
});

describe('goal types', () => {
  it('muscle gain uses a moderate surplus, capped at 15 % of expenditure', () => {
    const plan = planEnergy(man, { type: 'gain', rateKgPerWeek: 0.25, targetWeightKg: 95 });
    expect(plan.targetKcal).toBe(Math.round((tdee(man) + 275) / 10) * 10);
    const quiet: BodyInfo = { ...woman, activity: 1, exercisePerWeek: 0 };
    const greedy = planEnergy(quiet, { type: 'gain', rateKgPerWeek: 1, targetWeightKg: 90 });
    expect(greedy.adjustments).toContain('maxSurplus');
    expect(greedy.targetKcal).toBeLessThanOrEqual(Math.round((tdee(quiet) * 1.15) / 10) * 10 + 10);
  });

  it('recomposition is a small deficit without a target weight', () => {
    const plan = planEnergy(man, { type: 'recomp', rateKgPerWeek: 0.5, targetWeightKg: 80 });
    expect(plan.goal).toBe('recomp');
    expect(plan.targetKcal).toBe(Math.round((tdee(man) * 0.9) / 10) * 10);
    expect(plan.weeksToGoal).toBeNull();
    expect(plan.targetWeightKg).toBe(man.weightKg);
  });

  it('recomposition makes no deficit for minors or during pregnancy', () => {
    expect(planEnergy({ ...woman, ageYears: 16 }, { type: 'recomp', rateKgPerWeek: 0, targetWeightKg: 75 }).goal).toBe(
      'maintain',
    );
    const pregnant = planEnergy({ ...woman, pregnancy: 'pregnant' }, { type: 'recomp', rateKgPerWeek: 0, targetWeightKg: 75 });
    expect(pregnant.goal).toBe('maintain');
    expect(pregnant.adjustments).toEqual(['pregnancy']);
  });

  it('an adaptive expenditure replaces the formula but keeps every safety rule', () => {
    const plan = planEnergy(woman, { type: 'lose', rateKgPerWeek: 0.75, targetWeightKg: 65 }, { tdeeOverride: 1500 });
    expect(plan.tdee).toBe(1500);
    expect(plan.targetKcal).toBeGreaterThanOrEqual(KCAL_FLOOR.female);
    expect(plan.targetKcal).toBeGreaterThanOrEqual(1500 * 0.75);
  });
});

describe('diet styles', () => {
  const sum = (m: { proteinG: number; carbsG: number; fatG: number }) => m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9;

  it('every style keeps fat at least 25 % and adds up to the target', () => {
    for (const style of ['balanced', 'highProtein', 'lowCarb', 'vegetarian'] as const) {
      const m = macroTargets(2000, 'lose', 75, 165, style);
      expect(m.fatG * 9).toBeGreaterThanOrEqual(2000 * 0.25 - 25);
      expect(Math.abs(sum(m) - 2000)).toBeLessThanOrEqual(40);
    }
  });

  it('high protein gives more protein, low carb fewer carbohydrates (but at least 100 g)', () => {
    const balanced = macroTargets(2000, 'maintain', 75, 165, 'balanced');
    expect(macroTargets(2000, 'maintain', 75, 165, 'highProtein').proteinG).toBeGreaterThan(balanced.proteinG);
    const lowCarb = macroTargets(2000, 'maintain', 75, 165, 'lowCarb');
    expect(lowCarb.carbsG).toBeLessThan(balanced.carbsG);
    expect(macroTargets(1200, 'lose', 60, 160, 'lowCarb').carbsG).toBeGreaterThanOrEqual(100);
  });

  it('plant-based adds protein for digestibility', () => {
    expect(macroTargets(2000, 'maintain', 75, 165, 'vegetarian').proteinG).toBeGreaterThan(
      macroTargets(2000, 'maintain', 75, 165, 'balanced').proteinG,
    );
  });
});

describe('calorie cycling', () => {
  it('moves energy to the chosen days and keeps the weekly total', () => {
    const week = cycleWeek(2000, { enabled: true, highDays: [5, 6], extraKcal: 300 }, 1200);
    expect(week.perDay[5]).toBe(2300);
    expect(week.perDay[0]).toBe(1880);
    expect(Math.abs(week.perDay.reduce((a, b) => a + b, 0) - 14000)).toBeLessThanOrEqual(40);
    expect(week.limited).toBe(false);
  });

  it('never lets low days fall below the floor', () => {
    const week = cycleWeek(1300, { enabled: true, highDays: [5, 6], extraKcal: 500 }, 1200);
    expect(Math.min(...week.perDay)).toBeGreaterThanOrEqual(1200);
    expect(week.limited).toBe(true);
  });

  it('is flat when off', () => {
    expect(cycleWeek(1800, { enabled: false, highDays: [5], extraKcal: 300 }, 1200).perDay).toEqual(Array(7).fill(1800));
  });

  it('uses Monday-based weekdays', () => {
    expect(weekdayOf(new Date(2026, 10, 9))).toBe(0); // Monday 9.11.2026
    expect(weekdayOf(new Date(2026, 10, 15))).toBe(6);
  });
});

describe('progress, forecast and adaptive expenditure', () => {
  const series = (n: number, start: number, perDay: number) =>
    Array.from({ length: n }, (_, i) => ({
      date: new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10),
      kg: Math.round((start + perDay * i) * 100) / 100,
    }));

  it('fits a weight slope', () => {
    expect(weightSlopePerDay(series(21, 80, -0.1))).toBeCloseTo(-0.1, 2);
    expect(weightSlopePerDay([{ date: '2026-10-01', kg: 80 }])).toBeNull();
  });

  it('marks quarter-way milestones', () => {
    const list = milestones(80, 76, 72);
    expect(list.map((m) => m.kg)).toEqual([78, 76, 74, 72]);
    expect(list.map((m) => m.reached)).toEqual([true, true, false, false]);
  });

  it('forecasts the goal date from the trend, or nothing when it goes the other way', () => {
    const now = new Date(Date.UTC(2026, 9, 28));
    expect(forecastDate(series(28, 80, -0.05), 75, now)).not.toBeNull();
    expect(forecastDate(series(28, 80, 0.05), 75, now)).toBeNull();
  });

  it('estimates expenditure from intake and the weight trend', () => {
    const weights = series(21, 80, -0.05); // −0.35 kg / week
    const intake = Object.fromEntries(weights.map((w) => [w.date, 2000]));
    const estimate = adaptiveExpenditure(weights, intake, '2026-10-21', 2350);
    expect(estimate.status).toBe('ok');
    if (estimate.status !== 'ok') return;
    // 2000 + 0.05 × 7700 = 2385
    expect(Math.abs(estimate.tdee - 2385)).toBeLessThanOrEqual(10);
    expect(estimate.weeklyChangeKg).toBeCloseTo(-0.35, 2);
  });

  it('waits for two weeks of data', () => {
    const weights = series(7, 80, -0.05);
    const intake = Object.fromEntries(weights.map((w) => [w.date, 2000]));
    expect(adaptiveExpenditure(weights, intake, '2026-10-07', 2350)).toEqual({
      status: 'notEnoughData',
      spanDays: 6,
      loggedDays: 7,
    });
  });

  it('flags an estimate far from the formula as unreliable (likely missed logging)', () => {
    const weights = series(21, 80, 0);
    const intake = Object.fromEntries(weights.map((w) => [w.date, 900]));
    expect(adaptiveExpenditure(weights, intake, '2026-10-21', 2400).status).toBe('unreliable');
  });
});
