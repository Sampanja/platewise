import { CHAINS } from '@/data/catalog/reference';
import type { ChainCode, CravingCode, PlanAnswers, ProposalMeal, Recipe } from '@/data/types';

import { eligibleRecipes, matchesCraving, planRules, proposalShoppingList, type UserRules } from './generate';
import type { IngredientIndex } from './recipes';

/**
 * Checks a proposal against everything the user asked for (budget, wishes;
 * allergies and diets are guaranteed by the generator) and, when something is
 * not met, explains why and offers concrete fixes. Pure functions: the
 * proposal screen and the backend can share them.
 */

export type ChainTotal = { chainCode: ChainCode; totalCents: number };

/** The same shopping list priced in every chain, cheapest first. */
export function compareChains(
  recipeIds: readonly string[],
  recipesById: Readonly<Record<string, Recipe>>,
  answers: PlanAnswers,
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
): ChainTotal[] {
  return CHAINS.map((chain) => ({
    chainCode: chain.code,
    totalCents: proposalShoppingList(recipeIds, recipesById, { ...answers, chainCode: chain.code }, index, pantry)
      .totalCents,
  })).sort((a, b) => a.totalCents - b.totalCents);
}

export type UnmetWish = {
  craving: CravingCode;
  /** `rules`: no recipe matching the wish passes the allergies and diets. `budget`: it did not fit. */
  reason: 'rules' | 'budget';
};

export type PlanFix =
  /** Raise the budget to this (whole euros, enough for the current list). */
  | { kind: 'raiseBudget'; budgetCents: number; byCents: number }
  /** Drop the most expensive free meal; the rest then fits the budget. */
  | { kind: 'fewerMeals'; dayOffset: number; mealCount: number; totalCents: number }
  /** The same list fits the budget in a cheaper chain. */
  | { kind: 'cheaperChain'; chainCode: ChainCode; totalCents: number };

export type Assessment = {
  totalCents: number;
  /** 0 when within budget. */
  overBudgetCents: number;
  unmetWishes: UnmetWish[];
  fixes: PlanFix[];
};

const MIN_MEALS = 2;

/** Rounds cents up to whole euros. */
export function ceilToEuro(cents: number): number {
  return Math.ceil(cents / 100) * 100;
}

export function assessProposal(input: {
  meals: readonly ProposalMeal[];
  answers: PlanAnswers;
  recipes: readonly Recipe[];
  recipesById: Readonly<Record<string, Recipe>>;
  index: IngredientIndex;
  user: UserRules;
}): Assessment {
  const { meals, answers, recipesById, index, user } = input;
  const ids = meals.map((meal) => meal.recipeId);
  const totalCents = proposalShoppingList(ids, recipesById, answers, index, user.pantry).totalCents;
  const overBudgetCents = Math.max(0, totalCents - answers.budgetCents);

  const pool = eligibleRecipes(input.recipes, index, planRules(user, answers));
  const unmetWishes: UnmetWish[] = answers.cravings
    .filter((craving) => !ids.some((id) => recipesById[id] && matchesCraving(recipesById[id], craving)))
    .map((craving) => ({
      craving,
      reason: pool.some((recipe) => matchesCraving(recipe, craving)) ? 'budget' : 'rules',
    }));

  const fixes: PlanFix[] = [];
  if (overBudgetCents > 0) {
    const budgetCents = ceilToEuro(totalCents);
    fixes.push({ kind: 'raiseBudget', budgetCents, byCents: budgetCents - answers.budgetCents });

    if (meals.length > MIN_MEALS) {
      const free = meals.filter((meal) => !meal.locked);
      // Try dropping each free meal; offer the cheapest resulting list that fits.
      let best: { dayOffset: number; totalCents: number } | null = null;
      for (const meal of free) {
        const rest = ids.filter((_, i) => meals[i].dayOffset !== meal.dayOffset);
        const restTotal = proposalShoppingList(rest, recipesById, answers, index, user.pantry).totalCents;
        if (restTotal <= answers.budgetCents && (!best || restTotal < best.totalCents)) {
          best = { dayOffset: meal.dayOffset, totalCents: restTotal };
        }
      }
      if (best) fixes.push({ kind: 'fewerMeals', mealCount: meals.length - 1, ...best });
    }

    const cheaper = compareChains(ids, recipesById, answers, index, user.pantry).find(
      (chain) => chain.chainCode !== answers.chainCode && chain.totalCents <= answers.budgetCents,
    );
    if (cheaper) fixes.push({ kind: 'cheaperChain', ...cheaper });
  }

  return { totalCents, overBudgetCents, unmetWishes, fixes };
}

/** Removes one meal from a proposal and renumbers the days so they stay consecutive. */
export function dropMeal(meals: readonly ProposalMeal[], dayOffset: number): ProposalMeal[] {
  return meals
    .filter((meal) => meal.dayOffset !== dayOffset)
    .map((meal, day) => ({ ...meal, dayOffset: day }));
}

/**
 * Fixes for a budget that is below the cheapest realistic list (questionnaire
 * summary): raise it to the minimum, or cook one dinner less if that fits.
 */
export function tightBudgetFixes(
  answers: PlanAnswers,
  minimumFor: (mealCount: number) => number,
): { raiseToCents: number; fewerMeals: number | null } {
  const raiseToCents = ceilToEuro(minimumFor(answers.mealCount));
  const fewer = answers.mealCount - 1;
  const fewerMeals = fewer >= MIN_MEALS && minimumFor(fewer) <= answers.budgetCents ? fewer : null;
  return { raiseToCents, fewerMeals };
}
