import type { Recipe } from '@/data/types';

import { seededRandom } from './generate';
import { isRecipeAllowed, type DietRules, type IngredientIndex } from './recipes';

/**
 * "Sinulle suositeltuja": recipes that pass the user's allergy and diet check,
 * are not already on the current plan, and resemble their favourites (same
 * main protein or cuisine). The order changes daily but is stable within a day.
 */
export function recommendRecipes(
  recipes: readonly Recipe[],
  index: IngredientIndex,
  rules: DietRules,
  favoriteIds: readonly string[],
  excludeIds: ReadonlySet<string>,
  daySeed: number,
  count = 8,
): Recipe[] {
  const random = seededRandom(daySeed);
  const favorites = recipes.filter((recipe) => favoriteIds.includes(recipe.id));
  const proteins = new Set(favorites.map((recipe) => recipe.mainProtein));
  const cuisines = new Set(favorites.map((recipe) => recipe.cuisine));

  return recipes
    .filter((recipe) => !excludeIds.has(recipe.id) && isRecipeAllowed(recipe, rules, index))
    .map((recipe) => ({
      recipe,
      score:
        (proteins.has(recipe.mainProtein) ? 3 : 0) +
        (cuisines.has(recipe.cuisine) ? 2 : 0) +
        (favoriteIds.includes(recipe.id) ? -2 : 0) +
        random() * 4,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ recipe }) => recipe);
}

/** Days since epoch for the local date: a seed that changes once a day. */
export function daySeed(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}
