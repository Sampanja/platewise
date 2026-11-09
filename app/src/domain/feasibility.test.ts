import { describe, expect, it } from '@jest/globals';

import { CHAINS, INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from '@/data/catalog';
import { DEFAULT_PANTRY } from '@/data/catalog/ingredients';
import type { PlanAnswers, ProposalMeal } from '@/data/types';

import { assessProposal, ceilToEuro, compareChains, dropMeal, tightBudgetFixes } from './feasibility';
import { generateMeals, proposalShoppingList } from './generate';

const index = INGREDIENTS_BY_ID;
const user = { allergens: [], diets: [], pantry: new Set(DEFAULT_PANTRY) };

function answers(overrides: Partial<PlanAnswers> = {}): PlanAnswers {
  return {
    budgetCents: 6000,
    eaters: 2,
    mealCount: 5,
    cookDouble: false,
    extraAllergens: [],
    extraDiets: [],
    cravings: [],
    chainCode: 's_group',
    ...overrides,
  };
}

function meals(a: PlanAnswers, seed = 3): ProposalMeal[] {
  return generateMeals({ answers: a, recipes: RECIPES, index, user, seed });
}

function assess(a: PlanAnswers, m: ProposalMeal[]) {
  return assessProposal({ meals: m, answers: a, recipes: RECIPES, recipesById: RECIPES_BY_ID, index, user });
}

describe('compareChains', () => {
  it('prices the same list in every chain, cheapest first, matching the chain multipliers', () => {
    const a = answers();
    const ids = meals(a).map((m) => m.recipeId);
    const result = compareChains(ids, RECIPES_BY_ID, a, index, user.pantry);
    expect(result.map((r) => r.chainCode).sort()).toEqual(CHAINS.map((c) => c.code).sort());
    for (let i = 1; i < result.length; i++) expect(result[i].totalCents).toBeGreaterThanOrEqual(result[i - 1].totalCents);
    // Lidl has the lowest multiplier, so it is cheapest.
    expect(result[0].chainCode).toBe('lidl');
    const own = result.find((r) => r.chainCode === a.chainCode);
    expect(own?.totalCents).toBe(proposalShoppingList(ids, RECIPES_BY_ID, a, index, user.pantry).totalCents);
  });
});

describe('assessProposal', () => {
  it('reports nothing to fix when the plan fits and covers the wishes', () => {
    const a = answers({ budgetCents: 50000, cravings: ['pasta'] });
    const result = assess(a, meals(a));
    expect(result.overBudgetCents).toBe(0);
    expect(result.unmetWishes).toEqual([]);
    expect(result.fixes).toEqual([]);
  });

  it('suggests raising the budget to the next whole euro when over budget', () => {
    const a = answers({ budgetCents: 500, mealCount: 4 });
    const m = meals(a);
    const result = assess(a, m);
    expect(result.overBudgetCents).toBe(result.totalCents - 500);
    const raise = result.fixes.find((f) => f.kind === 'raiseBudget');
    expect(raise).toEqual({ kind: 'raiseBudget', budgetCents: ceilToEuro(result.totalCents), byCents: ceilToEuro(result.totalCents) - 500 });
  });

  it('suggests dropping a meal only when the rest fits the budget', () => {
    const base = answers({ budgetCents: 100000, mealCount: 4 });
    const m = meals(base);
    const full = assess(base, m).totalCents;
    // Budget a little under the full list: dropping one dinner should fit.
    const a = { ...base, budgetCents: full - 50 };
    const fix = assess(a, m).fixes.find((f) => f.kind === 'fewerMeals');
    expect(fix).toBeDefined();
    if (fix?.kind !== 'fewerMeals') return;
    expect(fix.mealCount).toBe(3);
    expect(fix.totalCents).toBeLessThanOrEqual(a.budgetCents);
    // Far too small a budget: dropping one meal does not help, so it is not offered.
    const tiny = { ...base, budgetCents: 100 };
    expect(assess(tiny, m).fixes.some((f) => f.kind === 'fewerMeals')).toBe(false);
  });

  it('never drops a locked meal', () => {
    const base = answers({ budgetCents: 100000, mealCount: 3 });
    const m = meals(base).map((meal) => ({ ...meal, locked: true }));
    const a = { ...base, budgetCents: assess(base, m).totalCents - 50 };
    expect(assess(a, m).fixes.some((f) => f.kind === 'fewerMeals')).toBe(false);
  });

  it('suggests a cheaper chain when the same list fits there', () => {
    const base = answers({ budgetCents: 100000, chainCode: 'k_group' });
    const m = meals(base);
    const ids = m.map((x) => x.recipeId);
    const lidl = compareChains(ids, RECIPES_BY_ID, base, index, user.pantry).find((c) => c.chainCode === 'lidl');
    const a = { ...base, budgetCents: lidl!.totalCents };
    const fix = assess(a, m).fixes.find((f) => f.kind === 'cheaperChain');
    expect(fix).toEqual({ kind: 'cheaperChain', chainCode: 'lidl', totalCents: lidl!.totalCents });
  });

  it('explains an unmet wish: blocked by the rules vs. did not fit', () => {
    const a = answers({ budgetCents: 50000, cravings: ['fish'], extraAllergens: ['fish', 'crustaceans', 'molluscs'] });
    const m = meals(a);
    const result = assess(a, m);
    expect(result.unmetWishes).toEqual([{ craving: 'fish', reason: 'rules' }]);

    const b = answers({ budgetCents: 50000, cravings: ['soup'] });
    const noSoup = meals(answers({ budgetCents: 50000 })).filter((x) => RECIPES_BY_ID[x.recipeId].dishType !== 'soup');
    expect(assess(b, noSoup).unmetWishes).toEqual([{ craving: 'soup', reason: 'budget' }]);
  });
});

describe('dropMeal', () => {
  it('removes the day and keeps the days consecutive', () => {
    const m = meals(answers({ mealCount: 4 }));
    const result = dropMeal(m, 1);
    expect(result.map((x) => x.dayOffset)).toEqual([0, 1, 2]);
    expect(result.map((x) => x.recipeId)).toEqual([m[0], m[2], m[3]].map((x) => x.recipeId));
  });
});

describe('tightBudgetFixes', () => {
  const minimumFor = (count: number) => count * 1000 + 30;
  it('raises to the minimum rounded up to whole euros', () => {
    expect(tightBudgetFixes(answers({ mealCount: 4, budgetCents: 3500 }), minimumFor).raiseToCents).toBe(4100);
  });
  it('offers one meal less when that fits, never below two meals', () => {
    expect(tightBudgetFixes(answers({ mealCount: 4, budgetCents: 3500 }), minimumFor).fewerMeals).toBe(3);
    expect(tightBudgetFixes(answers({ mealCount: 4, budgetCents: 2000 }), minimumFor).fewerMeals).toBeNull();
    expect(tightBudgetFixes(answers({ mealCount: 2, budgetCents: 1500 }), minimumFor).fewerMeals).toBeNull();
  });
});
