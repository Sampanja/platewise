import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from '@/data/catalog';
import { DEFAULT_PANTRY } from '@/data/catalog/ingredients';
import type { PlanAnswers, Proposal } from '@/data/types';

import {
  acceptProposal,
  generateMeals,
  matchesCraving,
  minimumBudgetCents,
  NoRecipesError,
  proposalShoppingList,
  repairProposal,
  replacementDinner,
  replacePlanDinner,
  swapMeal,
} from './generate';
import { checkRecipe, isRecipeAllowed } from './recipes';

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
    priceRegion: 'FI',
    ...overrides,
  };
}

describe('generateMeals', () => {
  it('returns one dinner per requested day, no duplicates', () => {
    const meals = generateMeals({ answers: answers({ mealCount: 7 }), recipes: RECIPES, index, user, seed: 1 });
    expect(meals.map((m) => m.dayOffset)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(new Set(meals.map((m) => m.recipeId)).size).toBe(7);
  });

  it('is deterministic for the same seed', () => {
    const a = generateMeals({ answers: answers(), recipes: RECIPES, index, user, seed: 42 });
    const b = generateMeals({ answers: answers(), recipes: RECIPES, index, user, seed: 42 });
    expect(a).toEqual(b);
  });

  it('never proposes a recipe that breaks profile or plan-only rules', () => {
    const strictUser = { ...user, allergens: ['gluten'] as const, diets: ['vegetarian'] as const };
    for (let seed = 1; seed <= 20; seed++) {
      const meals = generateMeals({
        answers: answers({ extraAllergens: ['milk'] }),
        recipes: RECIPES,
        index,
        user: { ...strictUser, allergens: [...strictUser.allergens], diets: [...strictUser.diets] },
        seed,
      });
      for (const meal of meals) {
        for (const id of [meal.recipeId, ...meal.alternatives]) {
          const check = checkRecipe(RECIPES_BY_ID[id], index, {
            allergens: ['gluten', 'milk'],
            diets: ['vegetarian'],
          });
          expect(check.ok).toBe(true);
        }
      }
    }
  });

  it('prefers wished-for dishes', () => {
    const meals = generateMeals({
      answers: answers({ mealCount: 3, cravings: ['soup'], budgetCents: 20000 }),
      recipes: RECIPES,
      index,
      user,
      seed: 3,
    });
    expect(meals.every((m) => matchesCraving(RECIPES_BY_ID[m.recipeId], 'soup'))).toBe(true);
  });

  it('repairs towards the budget', () => {
    // Above the realistic minimum (about 49 €) but well below an unconstrained pick (about 67 €).
    const tight = answers({ budgetCents: 5500, mealCount: 5 });
    const meals = generateMeals({ answers: tight, recipes: RECIPES, index, user, seed: 7 });
    const list = proposalShoppingList(meals.map((m) => m.recipeId), RECIPES_BY_ID, tight, index, user.pantry);
    expect(list.totalCents).toBeLessThanOrEqual(5500);
  });

  it('keeps locked meals in place', () => {
    const meals = generateMeals({
      answers: answers({ mealCount: 3 }),
      recipes: RECIPES,
      index,
      user,
      seed: 5,
      keep: [{ dayOffset: 1, recipeId: 'pea-soup' }],
    });
    expect(meals[1]).toMatchObject({ recipeId: 'pea-soup', locked: true });
  });

  it('fails clearly when nothing passes the rules', () => {
    const onlyPasta = RECIPES.filter((recipe) => recipe.id === 'minced-penne');
    expect(() =>
      generateMeals({
        answers: answers({ extraAllergens: ['gluten'] }),
        recipes: onlyPasta,
        index,
        user,
        seed: 1,
      }),
    ).toThrow(NoRecipesError);
  });
});

describe('swapMeal', () => {
  const meals = [
    { dayOffset: 0, recipeId: 'a', locked: false, alternatives: ['b', 'c'] },
    { dayOffset: 1, recipeId: 'b', locked: false, alternatives: ['a', 'd'] },
  ];

  it('takes the first alternative not already in the plan and queues the old one', () => {
    const swapped = swapMeal(meals, 0);
    expect(swapped[0]).toMatchObject({ recipeId: 'c', alternatives: ['b', 'a'] });
    expect(swapped[1]).toBe(meals[1]);
  });

  it('does nothing for a locked meal', () => {
    const locked = [{ ...meals[0], locked: true }, meals[1]];
    expect(swapMeal(locked, 0)[0].recipeId).toBe('a');
  });
});

describe('minimumBudgetCents', () => {
  it('grows with eaters and meals', () => {
    const small = minimumBudgetCents(answers({ eaters: 1, mealCount: 2 }), RECIPES, index, user);
    const large = minimumBudgetCents(answers({ eaters: 4, mealCount: 7 }), RECIPES, index, user);
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });
});

describe('acceptProposal', () => {
  const proposal: Proposal = {
    id: 'p1',
    createdAt: '2026-11-08T10:00:00.000Z',
    startDate: '2026-11-08',
    answers: answers({ mealCount: 2, cookDouble: true, eaters: 2 }),
    meals: [
      { dayOffset: 0, recipeId: 'chicken-curry', locked: false, alternatives: [] },
      { dayOffset: 1, recipeId: 'dal', locked: false, alternatives: [] },
    ],
  };

  it('doubles dinners and adds free leftover lunches for the next day', () => {
    const plan = acceptProposal(proposal, RECIPES_BY_ID, index, user.pantry, new Date('2026-11-08T10:00:00Z'));
    const dinners = plan.meals.filter((m) => m.slot === 'dinner');
    const lunches = plan.meals.filter((m) => m.slot === 'lunch');
    expect(dinners.map((m) => m.servings)).toEqual([4, 4]);
    expect(lunches.map((m) => [m.dayOffset, m.recipeId, m.costCents])).toEqual([
      [1, 'chicken-curry', 0],
      [2, 'dal', 0],
    ]);
    expect(plan.kind).toBe('trip');
    expect(plan.status).toBe('accepted');
  });

  it('uses the whole-package list total as the plan estimate', () => {
    const plan = acceptProposal(proposal, RECIPES_BY_ID, index, user.pantry, new Date());
    const list = proposalShoppingList(['chicken-curry', 'dal'], RECIPES_BY_ID, proposal.answers, index, user.pantry);
    expect(plan.estimatedTotalCents).toBe(list.totalCents);
  });
});

describe('replacePlanDinner', () => {
  const proposal: Proposal = {
    id: 'p2',
    createdAt: '',
    startDate: '2026-11-08',
    answers: answers({ mealCount: 2, cookDouble: true }),
    meals: [
      { dayOffset: 0, recipeId: 'chicken-curry', locked: false, alternatives: [] },
      { dayOffset: 1, recipeId: 'dal', locked: false, alternatives: [] },
    ],
  };
  const plan = acceptProposal(proposal, RECIPES_BY_ID, index, user.pantry, new Date());

  it('swaps the dinner and its leftover lunch and recomputes the total', () => {
    const next = replacePlanDinner(plan, 0, 'steak-potatoes', RECIPES_BY_ID, index, user.pantry);
    const day0 = next.meals.filter((m) => m.dayOffset <= 1).map((m) => [m.dayOffset, m.slot, m.recipeId]);
    expect(day0).toEqual(
      expect.arrayContaining([
        [0, 'dinner', 'steak-potatoes'],
        [1, 'lunch', 'steak-potatoes'],
        [1, 'dinner', 'dal'],
      ]),
    );
    expect(next.estimatedTotalCents).toBeGreaterThan(plan.estimatedTotalCents);
  });

  it('leaves the plan unchanged for an unknown day', () => {
    expect(replacePlanDinner(plan, 9, 'dal', RECIPES_BY_ID, index, user.pantry)).toBe(plan);
  });
});

describe('plannable dinners', () => {
  it('never plans breakfasts or snacks', () => {
    for (let seed = 1; seed <= 10; seed++) {
      for (const meal of generateMeals({ answers: answers({ mealCount: 7 }), recipes: RECIPES, index, user, seed })) {
        for (const id of [meal.recipeId, ...meal.alternatives]) expect(RECIPES_BY_ID[id].meals).toContain('dinner');
      }
    }
  });
});

describe('replacementDinner', () => {
  const proposal: Proposal = {
    id: 'p3',
    createdAt: '',
    startDate: '2026-11-08',
    answers: answers({ mealCount: 2 }),
    meals: [
      { dayOffset: 0, recipeId: 'chicken-curry', locked: false, alternatives: [] },
      { dayOffset: 1, recipeId: 'salmon-coconut', locked: false, alternatives: [] },
    ],
  };
  const plan = acceptProposal(proposal, RECIPES_BY_ID, index, user.pantry, new Date());

  it('offers an allowed dinner that is not already in the plan', () => {
    const fishAllergy = { ...user, allergens: ['fish' as const] };
    const replacement = replacementDinner(plan, 1, RECIPES, index, fishAllergy);
    expect(replacement).not.toBeNull();
    expect(isRecipeAllowed(replacement!, fishAllergy, index)).toBe(true);
    expect(replacement!.meals).toContain('dinner');
    expect(['chicken-curry', 'salmon-coconut']).not.toContain(replacement!.id);
  });

  it('keeps the main protein when it still suits the user', () => {
    const lactoseFree = { ...user, diets: ['lactose_free' as const] };
    const replacement = replacementDinner(plan, 0, RECIPES, index, lactoseFree);
    expect(replacement?.mainProtein).toBe('chicken');
    expect(isRecipeAllowed(replacement!, lactoseFree, index)).toBe(true);
  });

  it("respects the plan's own extra rules", () => {
    const veganPlan = { ...plan, extraDiets: ['vegan' as const] };
    const replacement = replacementDinner(veganPlan, 0, RECIPES, index, user);
    expect(isRecipeAllowed(replacement!, { allergens: [], diets: ['vegan'] }, index)).toBe(true);
  });
});

describe('repairProposal', () => {
  const base = generateMeals({ answers: answers({ mealCount: 5 }), recipes: RECIPES, index, user, seed: 7 });
  const proposal: Proposal = { id: 'p4', createdAt: '', startDate: '2026-11-08', answers: answers({ mealCount: 5 }), meals: base };

  it('returns the same proposal when everything still suits', () => {
    expect(repairProposal(proposal, RECIPES, index, user)).toBe(proposal);
  });

  it('replaces unsuitable dinners and alternatives after a new allergy', () => {
    const withFish: Proposal = {
      ...proposal,
      meals: proposal.meals.map((m, i) => (i === 0 ? { ...m, recipeId: 'salmon-coconut', locked: true } : m)),
    };
    const fishAllergy = { ...user, allergens: ['fish' as const] };
    const repaired = repairProposal(withFish, RECIPES, index, fishAllergy)!;
    expect(repaired.meals).toHaveLength(5);
    for (const meal of repaired.meals) {
      for (const id of [meal.recipeId, ...meal.alternatives]) {
        expect(isRecipeAllowed(RECIPES_BY_ID[id], fishAllergy, index)).toBe(true);
      }
    }
    // Suitable meals stay on their days.
    for (const old of withFish.meals.slice(1)) {
      if (isRecipeAllowed(RECIPES_BY_ID[old.recipeId], fishAllergy, index)) {
        expect(repaired.meals[old.dayOffset].recipeId).toBe(old.recipeId);
      }
    }
  });
});
