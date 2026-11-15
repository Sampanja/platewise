import { DIET_EXCLUDED_TAGS } from '@/data/catalog/reference';
import type { MealType, Recipe } from '@/data/types';

import { matchesCraving } from './generate';
import type { IngredientIndex } from './recipes';

export type RecipeFilter =
  | 'favorites'
  | 'quick'
  | 'cheap'
  | 'vegetarian'
  | 'vegan'
  | 'glutenFree'
  | 'highProtein'
  | 'fish'
  | 'chicken'
  | 'meat'
  | 'soup'
  | 'salad'
  | 'pasta'
  | 'finnish'
  | 'asian'
  | 'mexican'
  | 'leftovers';

export const RECIPE_FILTERS: readonly RecipeFilter[] = [
  'favorites',
  'quick',
  'cheap',
  'vegetarian',
  'vegan',
  'glutenFree',
  'highProtein',
  'fish',
  'chicken',
  'meat',
  'soup',
  'salad',
  'pasta',
  'finnish',
  'asian',
  'mexican',
  'leftovers',
];

/** "Kaikki" or one meal of the day. */
export type MealChoice = MealType | 'all';
export const MEAL_CHOICES: readonly MealChoice[] = ['all', 'breakfast', 'lunch', 'dinner', 'snack'];

export type RecipeSort = 'recommended' | 'price' | 'time' | 'kcal';

/** "Edullinen": price estimate per serving at most this many cents at the user's store. */
export const CHEAP_MAX_CENTS = 250;
/** "Proteiinipitoinen": at least this much protein per serving. */
export const HIGH_PROTEIN_MIN_G = 35;

export type FilterContext = {
  favoriteIds: readonly string[];
  servingPrice: (recipe: Recipe) => number;
};

export function matchesFilter(recipe: Recipe, filter: RecipeFilter, context: FilterContext): boolean {
  switch (filter) {
    case 'favorites':
      return context.favoriteIds.includes(recipe.id);
    case 'quick':
    case 'vegetarian':
    case 'soup':
    case 'pasta':
    case 'asian':
    case 'mexican':
    case 'fish':
    case 'chicken':
      return matchesCraving(recipe, filter);
    case 'cheap':
      return context.servingPrice(recipe) <= CHEAP_MAX_CENTS;
    case 'highProtein':
      return recipe.perServing.proteinG >= HIGH_PROTEIN_MIN_G;
    case 'vegan':
      return !DIET_EXCLUDED_TAGS.vegan.some((tag) => recipe.tags.includes(tag));
    case 'glutenFree':
      return !recipe.allergens.includes('gluten');
    case 'salad':
      return recipe.dishType === 'salad';
    case 'finnish':
      return recipe.cuisine === 'finnish';
    case 'meat':
      return ['beef', 'pork', 'minced_meat'].includes(recipe.mainProtein);
    case 'leftovers':
      return recipe.goodForLeftovers;
  }
}

/** Lower-cased, accent-insensitive text for search. */
function normalize(text: string): string {
  return text.toLowerCase().normalize('NFC').trim();
}

/** Matches every word of the query against the title, description and ingredient names. */
export function matchesSearch(recipe: Recipe, query: string, index: IngredientIndex): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(
    [
      recipe.title,
      recipe.description,
      ...recipe.ingredients.map((item) => index[item.ingredientId]?.name ?? ''),
    ].join(' '),
  );
  return words.every((word) => haystack.includes(word));
}

export function filterRecipes(
  recipes: readonly Recipe[],
  options: {
    query: string;
    /** Meal of the day; omitted or 'all' = every meal. */
    meal?: MealChoice;
    filters: readonly RecipeFilter[];
    sort: RecipeSort;
    context: FilterContext;
    index: IngredientIndex;
  },
): Recipe[] {
  const { query, filters, sort, context, index } = options;
  const meal = options.meal ?? 'all';
  const result = recipes.filter(
    (recipe) =>
      (meal === 'all' || recipe.meals.includes(meal)) &&
      matchesSearch(recipe, query, index) &&
      filters.every((filter) => matchesFilter(recipe, filter, context)),
  );
  switch (sort) {
    case 'price':
      return result.sort((a, b) => context.servingPrice(a) - context.servingPrice(b));
    case 'time':
      return result.sort((a, b) => a.totalTimeMin - b.totalTimeMin);
    case 'kcal':
      return result.sort((a, b) => a.perServing.kcal - b.perServing.kcal);
    case 'recommended':
      return result;
  }
}
