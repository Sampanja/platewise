import type { CatalogText } from '../types';
import { EN_DISH_DEFAULTS } from './dishDefaults';

/**
 * English catalog text. Recipes are added in batches (recipesNN.ts, the same
 * batches as the Finnish text); until a batch is translated its recipes show
 * the Finnish text.
 */
export const enText: CatalogText = {
  recipes: {},
  ingredients: {},
  foods: {},
  dishDefaults: EN_DISH_DEFAULTS,
};
