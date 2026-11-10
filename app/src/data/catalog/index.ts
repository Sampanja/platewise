import { deriveRecipe } from '@/domain/recipes';

import type { Recipe, RecipeSource } from '../types';
import { FOODS, FOODS_BY_ID } from './foods';
import { DEFAULT_PANTRY, INGREDIENTS, INGREDIENTS_BY_ID, PANTRY_ELIGIBLE } from './ingredients';
import { RECIPES_1 } from './recipes1';
import { RECIPES_2 } from './recipes2';
import { RECIPES_3 } from './recipes3';
import { RECIPES_4 } from './recipes4';
import { RECIPES_5 } from './recipes5';
import { RECIPES_6 } from './recipes6';
import { RECIPES_7 } from './recipes7';
import { RECIPES_8 } from './recipes8';
import { RECIPES_9 } from './recipes9';
import { RECIPES_10 } from './recipes10';
import { RECIPES_11 } from './recipes11';
import { RECIPES_12 } from './recipes12';
import { RECIPES_13 } from './recipes13';

/** Every recipe batch, in the order they were written. */
const SOURCES: readonly RecipeSource[] = [...RECIPES_1, ...RECIPES_2, ...RECIPES_3, ...RECIPES_4, ...RECIPES_5, ...RECIPES_6, ...RECIPES_7, ...RECIPES_8, ...RECIPES_9, ...RECIPES_10, ...RECIPES_11, ...RECIPES_12, ...RECIPES_13];

/**
 * Local recipe library. Recipes are derived the way the backend will derive
 * them: macros, allergens, diet tags and base cost from ingredient data.
 */
export const RECIPES: readonly Recipe[] = SOURCES.map((source) => deriveRecipe(source, INGREDIENTS_BY_ID));

export const RECIPES_BY_ID: Readonly<Record<string, Recipe>> = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

export { DEFAULT_PANTRY, FOODS, FOODS_BY_ID, INGREDIENTS, INGREDIENTS_BY_ID, PANTRY_ELIGIBLE };
export * from './reference';
