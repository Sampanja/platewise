import type { Recipe } from '@/data/types';

import type { RecognitionMode } from './foodRecognition';

/**
 * "Luo resepti näistä aineksista": a dinner made mainly from what is at home.
 *
 * Backend phase: the `generate-recipe` Edge Function asks Claude for a recipe
 * from the closed ingredient table (docs/GENERATION.md, section 21), runs the
 * same allergy and diet check (principle 4), derives macros, price and
 * allergens from the table, stores it for reuse and returns it.
 *
 * Test mode: picks the allowed library recipe that uses the most of the given
 * ingredients and is not already suggested. The screen says it is test mode.
 */
export type GenerationRequest = {
  /** Pantry ingredient ids, the ones expiring soon first. */
  ingredientIds: readonly string[];
  /** Recipes the user may see (already passed isRecipeAllowed). The result must be one of these or pass the same gate. */
  allowed: readonly Recipe[];
  /** Recipe ids already on screen, not to be offered again. */
  exclude: ReadonlySet<string>;
  staples: ReadonlySet<string>;
};

export type GeneratedRecipe = { recipe: Recipe; usedIds: string[] };

export interface RecipeGenerationService {
  readonly mode: RecognitionMode;
  /** Null when nothing sensible can be made from these. */
  fromIngredients(request: GenerationRequest): Promise<GeneratedRecipe | null>;
}

/** The library recipe that uses most of the ingredients (ties: fewest other ingredients, then quickest). */
export function bestLibraryMatch({ ingredientIds, allowed, exclude, staples }: GenerationRequest): GeneratedRecipe | null {
  const have = new Set(ingredientIds);
  let best: { recipe: Recipe; used: string[]; other: number } | null = null;
  for (const recipe of allowed) {
    if (exclude.has(recipe.id)) continue;
    const needed = [...new Set(recipe.ingredients.map((i) => i.ingredientId))].filter((id) => !staples.has(id));
    const used = needed.filter((id) => have.has(id));
    if (used.length < 2) continue;
    const other = needed.length - used.length;
    if (
      !best ||
      used.length > best.used.length ||
      (used.length === best.used.length && other < best.other) ||
      (used.length === best.used.length && other === best.other && recipe.totalTimeMin < best.recipe.totalTimeMin)
    ) {
      best = { recipe, used, other };
    }
  }
  return best ? { recipe: best.recipe, usedIds: best.used } : null;
}

const TEST_LATENCY_MS = 1400;

const testDataGeneration: RecipeGenerationService = {
  mode: 'test',
  fromIngredients: (request) => new Promise((resolve) => setTimeout(() => resolve(bestLibraryMatch(request)), TEST_LATENCY_MS)),
};

/** The active implementation: test mode until the backend phase. */
export const recipeGeneration: RecipeGenerationService = testDataGeneration;
