import type { CatalogText } from '../types';
import { EN_DISH_DEFAULTS } from './dishDefaults';
import { EN_FOODS } from './foods';
import { EN_INGREDIENTS } from './ingredients';
import { EN_RECIPES_01 } from './recipes01';
import { EN_RECIPES_02 } from './recipes02';
import { EN_RECIPES_03 } from './recipes03';
import { EN_RECIPES_04 } from './recipes04';
import { EN_RECIPES_05 } from './recipes05';
import { EN_RECIPES_06 } from './recipes06';
import { EN_RECIPES_07 } from './recipes07';
import { EN_RECIPES_08 } from './recipes08';

/**
 * English catalog text. Recipes are added in batches (recipesNN.ts, the same
 * batches as the Finnish text); until a batch is translated its recipes show
 * the Finnish text.
 */
export const enText: CatalogText = {
  recipes: {
    ...EN_RECIPES_01,
    ...EN_RECIPES_02,
    ...EN_RECIPES_03,
    ...EN_RECIPES_04,
    ...EN_RECIPES_05,
    ...EN_RECIPES_06,
    ...EN_RECIPES_07,
    ...EN_RECIPES_08,
  },
  ingredients: EN_INGREDIENTS,
  foods: EN_FOODS,
  dishDefaults: EN_DISH_DEFAULTS,
};
