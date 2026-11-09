import { describe, expect, it } from '@jest/globals';

import {
  activityFactor,
  bmrMifflin,
  goalProgress,
  KCAL_FLOOR,
  macroTargets,
  minHealthyWeightKg,
  movingAverage,
  planEnergy,
  shouldSuggestRecalculation,
  tdee,
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

describe('bmr and tdee', () => {
  it('uses Mifflin–St Jeor', () => {
    // 10·75 + 6.25·165 − 5·35 − 161 = 1445.25
    expect(bmrMifflin(woman)).toBeCloseTo(1445.25);
    // 10·90 + 6.25·180 − 5·35 + 5 = 1855
    expect(bmrMifflin(man)).toBeCloseTo(1855);
  });

  it('adds exercise sessions to the everyday activity factor, capped', () => {
    expect(activityFactor(1, 0)).toBeCloseTo(1.2);
    expect(activityFactor(2, 2)).toBeCloseTo(1.37);
    expect(activityFactor(5, 14)).toBe(2.0);
    expect(tdee(woman)).toBeCloseTo(1445.25 * 1.37);
  });
});

describe('planEnergy', () => {
  it('maintenance equals total expenditure', () => {
    const plan = planEnergy(woman, { type: 'maintain', rateKgPerWeek: 0.5, targetWeightKg: 75 });
    expect(plan.targetKcal).toBe(Math.round(tdee(woman) / 10) * 10);
    expect(plan.weeksToGoal).toBeNull();
    expect(plan.adjustments).toEqual([]);
  });

  it('subtracts 7 700 kcal per kg spread over the week', () => {
    const plan = planEnergy(man, { type: 'lose', rateKgPerWeek: 0.5, targetWeightKg: 82 });
    expect(plan.requestedKcal).toBe(Math.round((tdee(man) - 550) / 10) * 10);
    expect(plan.adjustments).toEqual([]);
    expect(plan.weeklyChangeKg).toBeCloseTo(-0.5, 1);
    expect(plan.weeksToGoal).toBe(16);
  });

  it('caps the deficit at 25 % of expenditure', () => {
    const small: BodyInfo = { ...woman, weightKg: 62, heightCm: 160, activity: 1, exercisePerWeek: 0, ageYears: 50 };
    const plan = planEnergy(small, { type: 'lose', rateKgPerWeek: 0.75, targetWeightKg: 56 });
    const total = tdee(small);
    expect(plan.targetKcal).toBeGreaterThanOrEqual(Math.round((total * 0.75) / 10) * 10 - 10);
    expect(plan.adjustments).toContain('maxDeficit');
  });

  it('never goes below 1 200 kcal for women and 1 500 kcal for men', () => {
    const tiny: BodyInfo = { ...woman, weightKg: 55, heightCm: 152, ageYears: 70, activity: 1, exercisePerWeek: 0 };
    const plan = planEnergy(tiny, { type: 'lose', rateKgPerWeek: 0.75, targetWeightKg: 50 });
    expect(plan.targetKcal).toBe(KCAL_FLOOR.female);
    expect(plan.adjustments).toContain('floor');
    // Expenditure (~1 190 kcal) is below the floor: no deficit, so no loss goal or goal date.
    expect(tdee(tiny)).toBeLessThan(KCAL_FLOOR.female);
    expect(plan.goal).toBe('maintain');
    expect(plan.adjustments).toContain('noRoomForDeficit');
    expect(plan.weeksToGoal).toBeNull();
    expect(plan.weeklyChangeKg).toBe(0);

    const smallMan: BodyInfo = { ...man, weightKg: 62, heightCm: 165, ageYears: 75, activity: 1, exercisePerWeek: 0 };
    expect(planEnergy(smallMan, { type: 'lose', rateKgPerWeek: 0.75, targetWeightKg: 56 }).targetKcal).toBe(1500);
  });

  it('gives no weight-loss target to under 18-year-olds', () => {
    const teen = { ...woman, ageYears: 16 };
    const plan = planEnergy(teen, { type: 'lose', rateKgPerWeek: 0.5, targetWeightKg: 65 });
    expect(plan.goal).toBe('maintain');
    expect(plan.adjustments).toEqual(['minor']);
    expect(plan.targetKcal).toBe(Math.round(tdee(teen) / 10) * 10);
  });

  it('makes no deficit while pregnant or breastfeeding', () => {
    for (const pregnancy of ['pregnant', 'breastfeeding'] as const) {
      const plan = planEnergy({ ...woman, pregnancy }, { type: 'lose', rateKgPerWeek: 0.5, targetWeightKg: 68 });
      expect(plan.goal).toBe('maintain');
      expect(plan.adjustments).toEqual(['pregnancy']);
    }
  });

  it('does not accept a target weight below BMI 18.5', () => {
    const plan = planEnergy(woman, { type: 'lose', rateKgPerWeek: 0.5, targetWeightKg: 45 });
    expect(plan.adjustments).toContain('underweightTarget');
    expect(plan.targetWeightKg).toBe(minHealthyWeightKg(165));
    expect(plan.targetWeightKg).toBeGreaterThanOrEqual(18.5 * 1.65 * 1.65);
  });

  it('gives maintenance to someone already underweight who asks to lose', () => {
    const thin = { ...woman, weightKg: 48 };
    const plan = planEnergy(thin, { type: 'lose', rateKgPerWeek: 0.25, targetWeightKg: 45 });
    expect(plan.goal).toBe('maintain');
    expect(plan.adjustments).toEqual(['alreadyUnderweight']);
  });

  it('adds a surplus for weight gain', () => {
    const plan = planEnergy(woman, { type: 'gain', rateKgPerWeek: 0.25, targetWeightKg: 78 });
    expect(plan.targetKcal).toBeGreaterThan(tdee(woman));
    // 3 kg at ~0.25 kg/week; rounding the target to 10 kcal can add a week.
    expect(plan.weeksToGoal).toBeGreaterThanOrEqual(12);
    expect(plan.weeksToGoal).toBeLessThanOrEqual(13);
  });

  it('treats a loss target at or above current weight as maintenance', () => {
    const plan = planEnergy(woman, { type: 'lose', rateKgPerWeek: 0.5, targetWeightKg: 80 });
    expect(plan.goal).toBe('maintain');
    expect(plan.adjustments).toEqual(['targetNotBelow']);
  });
});

describe('macroTargets', () => {
  it('gives more protein when losing and keeps fat at least 25 % of energy', () => {
    const lose = macroTargets(1800, 'lose', 75, 165);
    const keep = macroTargets(1800, 'maintain', 75, 165);
    expect(lose.proteinG).toBeGreaterThan(keep.proteinG);
    expect(lose.fatG * 9).toBeGreaterThanOrEqual(1800 * 0.25 - 45);
    const energy = lose.proteinG * 4 + lose.carbsG * 4 + lose.fatG * 9;
    expect(Math.abs(energy - 1800)).toBeLessThan(60);
  });

  it('bases protein on at most the BMI-25 weight', () => {
    const heavy = macroTargets(2200, 'lose', 140, 170);
    expect(heavy.proteinG).toBeLessThanOrEqual(Math.ceil((1.8 * 25 * 1.7 * 1.7) / 5) * 5);
  });
});

describe('weight tracking', () => {
  const entries = [
    { date: '2026-11-01', kg: 80 },
    { date: '2026-11-02', kg: 81 },
    { date: '2026-11-03', kg: 79 },
    { date: '2026-11-10', kg: 78 },
  ];

  it('smooths with a trailing 7-day average', () => {
    expect(movingAverage(entries).map((e) => e.kg)).toEqual([80, 80.5, 80, 78]);
  });

  it('suggests recalculating after a 2 kg trend change', () => {
    expect(shouldSuggestRecalculation(entries, 80)).toBe(true);
    expect(shouldSuggestRecalculation(entries, 79)).toBe(false);
    expect(shouldSuggestRecalculation([], 79)).toBe(false);
  });

  it('measures progress towards the target', () => {
    expect(goalProgress(80, 77, 74)).toBeCloseTo(0.5);
    expect(goalProgress(80, 82, 74)).toBe(0);
    expect(goalProgress(60, 63, 66)).toBeCloseTo(0.5);
  });
});
