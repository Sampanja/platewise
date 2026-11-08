import { describe, expect, it } from '@jest/globals';

import type { MealPlan, PlanMeal } from '@/data/types';

import { budgetHeadroomCents, lastDinnerDate, savingsCents, upcomingDinners } from './plan';

function meal(dayOffset: number, slot: PlanMeal['slot'] = 'dinner'): PlanMeal {
  return { dayOffset, slot, recipeId: `r${dayOffset}`, servings: 2, costCents: 500, cookDouble: false };
}

function plan(meals: PlanMeal[], overrides: Partial<MealPlan> = {}): MealPlan {
  return {
    id: 'p',
    kind: 'trip',
    startDate: '2026-10-29',
    mealCount: meals.length,
    householdSize: 2,
    budgetCents: 5000,
    chainCode: 'lidl',
    estimatedTotalCents: 4200,
    status: 'accepted',
    acceptedAt: null,
    meals,
    extraAllergens: [],
    extraDiets: [],
    ...overrides,
  };
}

describe('upcomingDinners', () => {
  it('drops past dinners and dates the rest from the start date', () => {
    const result = upcomingDinners(plan([meal(0), meal(1), meal(2)]), '2026-10-30');
    expect(result.map((m) => m.date)).toEqual(['2026-10-30', '2026-10-31']);
  });

  it('excludes leftover lunches', () => {
    const result = upcomingDinners(plan([meal(0), meal(1, 'lunch'), meal(1)]), '2026-10-29');
    expect(result.every((m) => m.slot === 'dinner')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('sorts by day even when meals are stored out of order', () => {
    const result = upcomingDinners(plan([meal(2), meal(0), meal(1)]), '2026-10-29');
    expect(result.map((m) => m.dayOffset)).toEqual([0, 1, 2]);
  });

  it('crosses month boundaries', () => {
    const result = upcomingDinners(plan([meal(3)]), '2026-10-29');
    expect(result[0].date).toBe('2026-11-01');
  });

  it('returns nothing once the plan is over', () => {
    expect(upcomingDinners(plan([meal(0), meal(1)]), '2026-11-05')).toEqual([]);
  });
});

describe('lastDinnerDate', () => {
  it('ignores a leftover lunch on the day after the last dinner', () => {
    expect(lastDinnerDate(plan([meal(0), meal(1), meal(2, 'lunch')]))).toBe('2026-10-30');
  });
});

describe('budgetHeadroomCents', () => {
  it('is positive under budget and negative over it', () => {
    expect(budgetHeadroomCents({ budgetCents: 5000, estimatedTotalCents: 4200 })).toBe(800);
    expect(budgetHeadroomCents({ budgetCents: 5000, estimatedTotalCents: 5320 })).toBe(-320);
  });
});

describe('savingsCents', () => {
  it('sums how far plans stayed under budget', () => {
    expect(
      savingsCents([
        { budgetCents: 5000, estimatedTotalCents: 4200 },
        { budgetCents: 3000, estimatedTotalCents: 2680 },
      ]),
    ).toBe(1120);
  });

  it('never counts going over budget as negative savings', () => {
    expect(
      savingsCents([
        { budgetCents: 5000, estimatedTotalCents: 4200 },
        { budgetCents: 3000, estimatedTotalCents: 3500 },
      ]),
    ).toBe(800);
  });

  it('is zero with no plans', () => {
    expect(savingsCents([])).toBe(0);
  });
});
