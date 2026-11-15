import type { CatalogText } from '../types';
import { SV_DISH_DEFAULTS } from './dishDefaults';
import { SV_FOODS } from './foods';
import { SV_INGREDIENTS } from './ingredients';
import { SV_RECIPES_01 } from './recipes01';
import { SV_RECIPES_02 } from './recipes02';
import { SV_RECIPES_03 } from './recipes03';
import { SV_RECIPES_04 } from './recipes04';

/**
 * Swedish catalog text. Recipes are added in batches (recipesNN.ts, the same
 * batches as the Finnish text); until a batch is translated its recipes show
 * the Finnish text.
 */
export const svText: CatalogText = {
  recipes: {
    ...SV_RECIPES_01,
    ...SV_RECIPES_02,
    ...SV_RECIPES_03,
    ...SV_RECIPES_04,
  },
  ingredients: SV_INGREDIENTS,
  foods: SV_FOODS,
  dishDefaults: SV_DISH_DEFAULTS,
};
