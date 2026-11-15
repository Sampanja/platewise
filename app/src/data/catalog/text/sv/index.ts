import type { CatalogText } from '../types';
import { SV_DISH_DEFAULTS } from './dishDefaults';
import { SV_FOODS } from './foods';
import { SV_INGREDIENTS } from './ingredients';
import { SV_RECIPES_01 } from './recipes01';
import { SV_RECIPES_02 } from './recipes02';
import { SV_RECIPES_03 } from './recipes03';
import { SV_RECIPES_04 } from './recipes04';
import { SV_RECIPES_05 } from './recipes05';
import { SV_RECIPES_06 } from './recipes06';
import { SV_RECIPES_07 } from './recipes07';
import { SV_RECIPES_08 } from './recipes08';
import { SV_RECIPES_09 } from './recipes09';
import { SV_RECIPES_10 } from './recipes10';
import { SV_RECIPES_11 } from './recipes11';
import { SV_RECIPES_12 } from './recipes12';
import { SV_RECIPES_13 } from './recipes13';

/** Swedish catalog text: every recipe, ingredient and food. */
export const svText: CatalogText = {
  recipes: {
    ...SV_RECIPES_01,
    ...SV_RECIPES_02,
    ...SV_RECIPES_03,
    ...SV_RECIPES_04,
    ...SV_RECIPES_05,
    ...SV_RECIPES_06,
    ...SV_RECIPES_07,
    ...SV_RECIPES_08,
    ...SV_RECIPES_09,
    ...SV_RECIPES_10,
    ...SV_RECIPES_11,
    ...SV_RECIPES_12,
    ...SV_RECIPES_13,
  },
  ingredients: SV_INGREDIENTS,
  foods: SV_FOODS,
  dishDefaults: SV_DISH_DEFAULTS,
};
