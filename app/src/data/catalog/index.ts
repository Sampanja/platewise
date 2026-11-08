import { deriveRecipe } from '@/domain/recipes';

import type { Recipe } from '../types';
import { FOODS, FOODS_BY_ID } from './foods';
import { DEFAULT_PANTRY, INGREDIENTS, INGREDIENTS_BY_ID, PANTRY_ELIGIBLE } from './ingredients';
import { RECIPES_1 } from './recipes1';
import { RECIPES_2 } from './recipes2';

/**
 * Local test catalog. Recipes are derived the way the backend will derive
 * them: macros, allergens, diet tags and base cost from ingredient data.
 */
export const RECIPES: readonly Recipe[] = [...RECIPES_1, ...RECIPES_2].map((source) =>
  deriveRecipe(source, INGREDIENTS_BY_ID),
);

export const RECIPES_BY_ID: Readonly<Record<string, Recipe>> = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

export { DEFAULT_PANTRY, FOODS, FOODS_BY_ID, INGREDIENTS, INGREDIENTS_BY_ID, PANTRY_ELIGIBLE };
export * from './reference';
