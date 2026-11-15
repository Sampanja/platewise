import type { CatalogText } from '../types';
import { SV_DISH_DEFAULTS } from './dishDefaults';

/**
 * Swedish catalog text. Recipes are added in batches (recipesNN.ts, the same
 * batches as the Finnish text); until a batch is translated its recipes show
 * the Finnish text.
 */
export const svText: CatalogText = {
  recipes: {},
  ingredients: {},
  foods: {},
  dishDefaults: SV_DISH_DEFAULTS,
};
