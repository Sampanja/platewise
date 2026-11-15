import type { CatalogText } from '../types';
import { FI_DISH_DEFAULTS } from './dishDefaults';
import { FI_FOODS } from './foods';
import { FI_INGREDIENTS } from './ingredients';
import { FI_RECIPES_01 } from './recipes01';
import { FI_RECIPES_02 } from './recipes02';
import { FI_RECIPES_03 } from './recipes03';
import { FI_RECIPES_04 } from './recipes04';
import { FI_RECIPES_05 } from './recipes05';
import { FI_RECIPES_06 } from './recipes06';
import { FI_RECIPES_07 } from './recipes07';
import { FI_RECIPES_08 } from './recipes08';
import { FI_RECIPES_09 } from './recipes09';
import { FI_RECIPES_10 } from './recipes10';
import { FI_RECIPES_11 } from './recipes11';
import { FI_RECIPES_12 } from './recipes12';
import { FI_RECIPES_13 } from './recipes13';

/** Finnish catalog text: the source language. */
export const fiText: CatalogText = {
  recipes: {
    ...FI_RECIPES_01,
    ...FI_RECIPES_02,
    ...FI_RECIPES_03,
    ...FI_RECIPES_04,
    ...FI_RECIPES_05,
    ...FI_RECIPES_06,
    ...FI_RECIPES_07,
    ...FI_RECIPES_08,
    ...FI_RECIPES_09,
    ...FI_RECIPES_10,
    ...FI_RECIPES_11,
    ...FI_RECIPES_12,
    ...FI_RECIPES_13,
  },
  ingredients: FI_INGREDIENTS,
  foods: FI_FOODS,
  dishDefaults: FI_DISH_DEFAULTS,
};
