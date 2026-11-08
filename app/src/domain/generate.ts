import { CHAINS_BY_CODE, DIET_EXCLUDED_TAGS, QUICK_MAX_MIN } from '@/data/catalog/reference';
import type {
  AllergenCode,
  CravingCode,
  DietCode,
  MealPlan,
  PlanAnswers,
  PlanMeal,
  Proposal,
  ProposalMeal,
  Recipe,
} from '@/data/types';

import { checkRecipe, recipeCostCents, type IngredientIndex } from './recipes';
import { buildShoppingList, type ShoppingList } from './shoppingList';

/**
 * Local stand-in for the `generate-plan` Edge Function: picks dinners from the
 * recipe library ("reuse before generation"), repairs the plan towards the
 * budget and prepares ready-made alternatives for "Vaihda". The allergy and
 * diet check is the same code the backend will run.
 */

export type UserRules = {
  allergens: readonly AllergenCode[];
  diets: readonly DietCode[];
  pantry: ReadonlySet<string>;
};

export type GenerateInput = {
  answers: PlanAnswers;
  recipes: readonly Recipe[];
  index: IngredientIndex;
  user: UserRules;
  seed: number;
  /** Meals kept as they are (locked in the proposal or chosen in advance). */
  keep?: readonly { dayOffset: number; recipeId: string }[];
};

/** Deterministic PRNG (mulberry32) so the same seed gives the same plan. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function matchesCraving(recipe: Recipe, craving: CravingCode): boolean {
  switch (craving) {
    case 'chicken':
      return recipe.mainProtein === 'chicken';
    case 'fish':
      return recipe.mainProtein === 'fish' || recipe.mainProtein === 'seafood';
    case 'minced':
      return recipe.mainProtein === 'minced_meat';
    case 'vegetarian':
      return !DIET_EXCLUDED_TAGS.vegetarian.some((tag) => recipe.tags.includes(tag));
    case 'pasta':
      return recipe.dishType === 'pasta';
    case 'soup':
      return recipe.dishType === 'soup';
    case 'asian':
      return recipe.cuisine === 'asian' || recipe.cuisine === 'indian';
    case 'mexican':
      return recipe.cuisine === 'mexican';
    case 'quick':
      return recipe.cookTimeMin <= QUICK_MAX_MIN;
    case 'oven':
      return recipe.oven;
  }
}

/** Rules for this plan: the profile's allergies and diets plus the ones added in the questionnaire. */
export function planRules(user: UserRules, answers: PlanAnswers) {
  return {
    allergens: [...new Set([...user.allergens, ...answers.extraAllergens])],
    diets: [...new Set([...user.diets, ...answers.extraDiets])],
  };
}

export function eligibleRecipes(
  recipes: readonly Recipe[],
  index: IngredientIndex,
  rules: { allergens: readonly AllergenCode[]; diets: readonly DietCode[] },
): Recipe[] {
  return recipes.filter((recipe) => checkRecipe(recipe, index, rules).ok);
}

/** Servings cooked for one dinner: everyone eats, doubled when tomorrow's lunch is included. */
export function dinnerServings(answers: Pick<PlanAnswers, 'eaters' | 'cookDouble'>): number {
  return answers.eaters * (answers.cookDouble ? 2 : 1);
}

export function proposalShoppingList(
  recipeIds: readonly string[],
  recipesById: Readonly<Record<string, Recipe>>,
  answers: PlanAnswers,
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
): ShoppingList {
  const servings = dinnerServings(answers);
  return buildShoppingList(
    recipeIds.map((id) => ({ recipe: recipesById[id], servings })),
    index,
    pantry,
    CHAINS_BY_CODE[answers.chainCode].priceMultiplier,
  );
}

const MAX_SAME_PROTEIN = 2;
const ALTERNATIVES_PER_MEAL = 4;
const REPAIR_ROUNDS = 40;

export class NoRecipesError extends Error {}

export function generateMeals(input: GenerateInput): ProposalMeal[] {
  const { answers, index, user, seed } = input;
  const random = seededRandom(seed);
  const pool = eligibleRecipes(input.recipes, index, planRules(user, answers));
  if (pool.length === 0) throw new NoRecipesError('No recipe passes the rules');

  const byId = Object.fromEntries(pool.map((recipe) => [recipe.id, recipe]));
  const multiplier = CHAINS_BY_CODE[answers.chainCode].priceMultiplier;
  const servings = dinnerServings(answers);
  const cost = (recipe: Recipe) =>
    recipeCostCents(recipe, index, user.pantry, multiplier, servings);
  const targetPerMeal = answers.budgetCents / answers.mealCount;

  const score = new Map<string, number>();
  for (const recipe of pool) {
    const wishes = answers.cravings.filter((craving) => matchesCraving(recipe, craving)).length;
    const overTarget = Math.max(0, cost(recipe) - targetPerMeal) / Math.max(targetPerMeal, 1);
    score.set(recipe.id, wishes * 10 + random() * 6 - overTarget * 8);
  }
  const ranked = [...pool].sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0));

  // 1. Fill days: kept meals first, then the best-ranked recipes with some variety.
  const kept = new Map<number, string>();
  for (const meal of input.keep ?? []) {
    if (byId[meal.recipeId] && meal.dayOffset < answers.mealCount) kept.set(meal.dayOffset, meal.recipeId);
  }
  const chosen: (string | null)[] = Array.from({ length: answers.mealCount }, (_, day) => kept.get(day) ?? null);
  const proteinCount = (protein: string) =>
    chosen.filter((id) => id && byId[id].mainProtein === protein).length;

  for (let day = 0; day < chosen.length; day++) {
    if (chosen[day]) continue;
    const pick =
      ranked.find((recipe) => !chosen.includes(recipe.id) && proteinCount(recipe.mainProtein) < MAX_SAME_PROTEIN) ??
      ranked.find((recipe) => !chosen.includes(recipe.id)) ??
      ranked[day % ranked.length];
    chosen[day] = pick.id;
  }
  const ids = chosen as string[];
  const lockedDays = new Set(kept.keys());

  // 2. Budget repair: swap the most expensive free meal for a cheaper one while over budget.
  const total = () => proposalShoppingList(ids, byId, answers, index, user.pantry).totalCents;
  for (let round = 0; round < REPAIR_ROUNDS && total() > answers.budgetCents; round++) {
    const current = total();
    const days = ids
      .map((id, day) => ({ day, cost: cost(byId[id]) }))
      .filter(({ day }) => !lockedDays.has(day))
      .sort((a, b) => b.cost - a.cost);
    let improved = false;
    for (const { day } of days) {
      const cheaper = [...pool]
        .filter((recipe) => !ids.includes(recipe.id))
        .sort((a, b) => cost(a) - cost(b));
      for (const candidate of cheaper.slice(0, 8)) {
        const previous = ids[day];
        ids[day] = candidate.id;
        if (total() < current) {
          improved = true;
          break;
        }
        ids[day] = previous;
      }
      if (improved) break;
    }
    if (!improved) break;
  }

  // 3. Ready-made alternatives per meal: same main protein first, then the best-ranked.
  //    Each day starts from a different point so meals do not all offer the same dishes.
  const unused = ranked.filter((recipe) => !ids.includes(recipe.id));
  return ids.map((recipeId, dayOffset) => {
    const shift = unused.length > 0 ? (dayOffset * 2) % unused.length : 0;
    const rotated = [...unused.slice(shift), ...unused.slice(0, shift)];
    const protein = byId[recipeId].mainProtein;
    const alternatives = [
      ...rotated.filter((recipe) => recipe.mainProtein === protein),
      ...rotated.filter((recipe) => recipe.mainProtein !== protein),
    ]
      .slice(0, ALTERNATIVES_PER_MEAL)
      .map((recipe) => recipe.id);
    return { dayOffset, recipeId, locked: lockedDays.has(dayOffset), alternatives };
  });
}

/**
 * "Vaihda": next ready-made alternative that is not already in the plan. The
 * replaced recipe goes to the end of the queue, so swapping cycles.
 */
export function swapMeal(meals: readonly ProposalMeal[], dayOffset: number): ProposalMeal[] {
  const inPlan = new Set(meals.map((meal) => meal.recipeId));
  return meals.map((meal) => {
    if (meal.dayOffset !== dayOffset || meal.locked) return meal;
    const next = meal.alternatives.find((id) => !inPlan.has(id));
    if (!next) return meal;
    return {
      ...meal,
      recipeId: next,
      alternatives: [...meal.alternatives.filter((id) => id !== next), meal.recipeId],
    };
  });
}

/**
 * Rough lowest realistic budget: the cheapest eligible dinners at whole-package
 * prices. Used to send the user back to the budget step with an explanation.
 */
export function minimumBudgetCents(
  answers: PlanAnswers,
  recipes: readonly Recipe[],
  index: IngredientIndex,
  user: UserRules,
): number {
  const pool = eligibleRecipes(recipes, index, planRules(user, answers));
  if (pool.length === 0) return 0;
  const multiplier = CHAINS_BY_CODE[answers.chainCode].priceMultiplier;
  const servings = dinnerServings(answers);
  const cheapest = [...pool]
    .sort(
      (a, b) =>
        recipeCostCents(a, index, user.pantry, multiplier, servings) -
        recipeCostCents(b, index, user.pantry, multiplier, servings),
    )
    .slice(0, answers.mealCount);
  const byId = Object.fromEntries(cheapest.map((recipe) => [recipe.id, recipe]));
  const ids = Array.from({ length: answers.mealCount }, (_, i) => cheapest[i % cheapest.length].id);
  return proposalShoppingList(ids, byId, answers, index, user.pantry).totalCents;
}

/** Turns an approved proposal into an accepted plan: dinners plus leftover lunches. */
export function acceptProposal(
  proposal: Proposal,
  recipesById: Readonly<Record<string, Recipe>>,
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
  acceptedAt: Date,
): MealPlan {
  const { answers } = proposal;
  const multiplier = CHAINS_BY_CODE[answers.chainCode].priceMultiplier;
  const servings = dinnerServings(answers);
  const meals: PlanMeal[] = [];
  for (const meal of proposal.meals) {
    const recipe = recipesById[meal.recipeId];
    meals.push({
      dayOffset: meal.dayOffset,
      slot: 'dinner',
      recipeId: meal.recipeId,
      servings,
      costCents: recipeCostCents(recipe, index, pantry, multiplier, servings),
      cookDouble: answers.cookDouble,
    });
    if (answers.cookDouble) {
      // Lunch costs nothing extra: the doubled dinner already paid for it.
      meals.push({
        dayOffset: meal.dayOffset + 1,
        slot: 'lunch',
        recipeId: meal.recipeId,
        servings: answers.eaters,
        costCents: 0,
        cookDouble: false,
      });
    }
  }
  const list = proposalShoppingList(
    proposal.meals.map((meal) => meal.recipeId),
    recipesById,
    answers,
    index,
    pantry,
  );
  return {
    id: proposal.id,
    kind: answers.mealCount === 7 ? 'week' : 'trip',
    startDate: proposal.startDate,
    mealCount: answers.mealCount,
    householdSize: answers.eaters,
    budgetCents: answers.budgetCents,
    chainCode: answers.chainCode,
    estimatedTotalCents: list.totalCents,
    status: 'accepted',
    acceptedAt: acceptedAt.toISOString(),
    meals,
    extraAllergens: answers.extraAllergens,
    extraDiets: answers.extraDiets,
  };
}


/**
 * "Lisää suunnitelmaan": replaces one day's dinner in an accepted plan (and the
 * next day's leftover lunch if the dinner was doubled), then recomputes the
 * meal cost and the whole-package list total.
 */
export function replacePlanDinner(
  plan: MealPlan,
  dayOffset: number,
  recipeId: string,
  recipesById: Readonly<Record<string, Recipe>>,
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
): MealPlan {
  const multiplier = CHAINS_BY_CODE[plan.chainCode].priceMultiplier;
  const recipe = recipesById[recipeId];
  const target = plan.meals.find((meal) => meal.slot === 'dinner' && meal.dayOffset === dayOffset);
  if (!recipe || !target) return plan;

  const meals = plan.meals.map((meal) => {
    if (meal === target) {
      return {
        ...meal,
        recipeId,
        costCents: recipeCostCents(recipe, index, pantry, multiplier, meal.servings),
      };
    }
    if (target.cookDouble && meal.slot === 'lunch' && meal.dayOffset === dayOffset + 1) {
      return { ...meal, recipeId };
    }
    return meal;
  });
  const list = buildShoppingList(
    meals
      .filter((meal) => meal.slot === 'dinner' && recipesById[meal.recipeId])
      .map((meal) => ({ recipe: recipesById[meal.recipeId], servings: meal.servings })),
    index,
    pantry,
    multiplier,
  );
  return { ...plan, meals, estimatedTotalCents: list.totalCents };
}
