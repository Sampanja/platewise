import { addDays, today, type LocalDate } from '@/lib/dates';

import type { DayNutrition, MealPlan, PlanMeal } from '../types';
import { mockRecipesById } from './recipes';

const HOUSEHOLD = 2;

function dinner(dayOffset: number, recipeId: string, cookDouble = false): PlanMeal {
  const servings = cookDouble ? HOUSEHOLD * 2 : HOUSEHOLD;
  return {
    dayOffset,
    slot: 'dinner',
    recipeId,
    servings,
    costCents: mockRecipesById[recipeId].baseCostPerServingCents * servings,
    cookDouble,
  };
}

function leftoverLunch(dayOffset: number, recipeId: string): PlanMeal {
  return { dayOffset, slot: 'lunch', recipeId, servings: HOUSEHOLD, costCents: 0, cookDouble: false };
}

/** Builds an accepted plan whose first dinner is `startDate`. */
function buildPlan(startDate: LocalDate): MealPlan {
  const meals = [
    dinner(0, 'grilled-chicken'),
    dinner(1, 'chicken-tomato-pan', true),
    leftoverLunch(2, 'chicken-tomato-pan'),
    dinner(2, 'minced-penne'),
    dinner(3, 'bulgur-bowl'),
    dinner(4, 'salmon-coconut'),
    dinner(5, 'chicken-curry'),
  ];
  // Whole packages cost a little more than the sum of per-meal shares.
  const estimatedTotalCents = meals.reduce((sum, meal) => sum + meal.costCents, 0) + 140;

  return {
    id: 'mock-plan-current',
    kind: 'trip',
    startDate,
    mealCount: 6,
    householdSize: HOUSEHOLD,
    budgetCents: 5000,
    chainCode: 'lidl',
    estimatedTotalCents,
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
    meals,
  };
}

/** Current plan started yesterday, so today's dinner is the second one. */
export function mockCurrentPlan(): MealPlan {
  return buildPlan(addDays(today(), -1));
}

/** Variant whose last dinner is today, to show the "time for a new list" state. */
export function mockEndingPlan(): MealPlan {
  return buildPlan(addDays(today(), -5));
}

/** Earlier accepted plans this month, for the savings figure. */
export const mockEarlierPlansThisMonth = [
  { budgetCents: 4500, estimatedTotalCents: 4120 },
  { budgetCents: 3000, estimatedTotalCents: 2680 },
] as const;

export function mockTodayNutrition(empty: boolean): DayNutrition {
  return {
    date: today(),
    eaten: empty
      ? { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
      : { kcal: 1240, proteinG: 68, carbsG: 140, fatG: 45 },
    goals: { kcal: 2000, proteinG: 100, carbsG: 230, fatG: 70 },
  };
}
