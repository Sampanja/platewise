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
import { EN_RECIPES_09 } from './recipes09';
import { EN_RECIPES_10 } from './recipes10';
import { EN_RECIPES_11 } from './recipes11';
import { EN_RECIPES_12 } from './recipes12';
import { EN_RECIPES_13 } from './recipes13';

/** English catalog text: every recipe, ingredient and food. */
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
    ...EN_RECIPES_09,
    ...EN_RECIPES_10,
    ...EN_RECIPES_11,
    ...EN_RECIPES_12,
    ...EN_RECIPES_13,
  },
  ingredients: EN_INGREDIENTS,
  foods: EN_FOODS,
  dishDefaults: EN_DISH_DEFAULTS,
};
