import { bestMatches, type Scored } from '@/domain/fuzzy';
import { LANGUAGES } from '@/i18n/languages';

import type { Food, Ingredient } from '../types';
import { FOODS } from './foods';
import { INGREDIENTS } from './ingredients';
import { foodText, ingredientText } from './text';

/**
 * Every name an ingredient goes by in any supported language, including its
 * piece names ("sipuli", "onions"). Search works whatever the UI language, so
 * a Swedish speaker can type "lök" in the Finnish UI and still find it.
 */
const ingredientNames = new Map<string, readonly string[]>();
function namesOfIngredient(ingredient: Ingredient): readonly string[] {
  let names = ingredientNames.get(ingredient.id);
  if (!names) {
    const all = new Set<string>();
    for (const language of LANGUAGES) {
      const text = ingredientText(ingredient.id, language);
      all.add(text.name);
      if (text.one) all.add(text.one);
      if (text.many) all.add(text.many);
    }
    names = [...all];
    ingredientNames.set(ingredient.id, names);
  }
  return names;
}

const foodNames = new Map<string, readonly string[]>();
function namesOfFood(food: Food): readonly string[] {
  let names = foodNames.get(food.id);
  if (!names) {
    names = [...new Set(LANGUAGES.map((language) => foodText(food.id, language).name))];
    foodNames.set(food.id, names);
  }
  return names;
}

/** Ingredients matching a query in any language, best first. */
export function searchIngredients(query: string, limit = 20): Scored<Ingredient>[] {
  return bestMatches(INGREDIENTS, namesOfIngredient, query, { limit });
}

/** Diary foods (Fineli) matching a query in any language, best first. */
export function searchCatalogFoods(query: string, limit = 20): Scored<Food>[] {
  return bestMatches(FOODS, namesOfFood, query, { limit });
}

/** At or above this score a match is shown without asking; below it the user confirms it. */
export const CONFIDENT_MATCH = 0.8;
