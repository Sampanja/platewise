import type { NutritionGoals } from '@/data/types';

import { cycleWeek, KCAL_FLOOR, weekdayOf, type Cycling, type Sex } from './energy';

/**
 * The day's goals with calorie cycling: the day's energy from the cycled
 * week; protein stays the same every day, carbohydrates and fat scale so the
 * macros add up to the day's energy.
 */
export function goalsForDate(goals: NutritionGoals, cycling: Cycling, sex: Sex | null, date: Date): NutritionGoals {
  if (!cycling.enabled) return goals;
  const week = cycleWeek(goals.kcal, cycling, KCAL_FLOOR[sex ?? 'female']);
  const kcal = week.perDay[weekdayOf(date)];
  if (kcal === goals.kcal) return goals;
  const proteinKcal = goals.proteinG * 4;
  const restBase = goals.kcal - proteinKcal;
  const factor = restBase > 0 ? (kcal - proteinKcal) / restBase : 1;
  return {
    kcal,
    proteinG: goals.proteinG,
    carbsG: Math.max(0, Math.round((goals.carbsG * factor) / 5) * 5),
    fatG: Math.max(0, Math.round((goals.fatG * factor) / 5) * 5),
  };
}
