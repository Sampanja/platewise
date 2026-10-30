import type { MealPlan, PlanMeal } from '@/data/types';
import { addDays, type LocalDate } from '@/lib/dates';

export type DatedMeal = PlanMeal & { date: LocalDate };

export function mealDate(plan: MealPlan, meal: PlanMeal): LocalDate {
  return addDays(plan.startDate, meal.dayOffset);
}

/** Dinners from `from` onwards, in date order. Past dinners are dropped. */
export function upcomingDinners(plan: MealPlan, from: LocalDate): DatedMeal[] {
  return plan.meals
    .filter((meal) => meal.slot === 'dinner')
    .map((meal) => ({ ...meal, date: mealDate(plan, meal) }))
    .filter((meal) => meal.date >= from)
    .sort((a, b) => a.dayOffset - b.dayOffset);
}

/** Date of the last dinner in the plan. */
export function lastDinnerDate(plan: MealPlan): LocalDate {
  const lastOffset = plan.meals
    .filter((meal) => meal.slot === 'dinner')
    .reduce((max, meal) => Math.max(max, meal.dayOffset), 0);
  return addDays(plan.startDate, lastOffset);
}

/** Positive: estimate is under budget by this much. Negative: over budget. */
export function budgetHeadroomCents(plan: Pick<MealPlan, 'budgetCents' | 'estimatedTotalCents'>): number {
  return plan.budgetCents - plan.estimatedTotalCents;
}

/**
 * "Savings" on the home screen: how far accepted plans' estimates stayed under
 * their budgets. Plans over budget count as zero, never as negative savings.
 */
export function savingsCents(
  plans: readonly Pick<MealPlan, 'budgetCents' | 'estimatedTotalCents'>[],
): number {
  return plans.reduce((sum, plan) => sum + Math.max(budgetHeadroomCents(plan), 0), 0);
}
