import type {
  AisleCode,
  AllergenCode,
  CravingCode,
  DietCode,
  IngredientTag,
} from '../types';

/** Allergens shown in pickers, most common first. */
export const ALLERGENS: readonly AllergenCode[] = [
  'milk',
  'gluten',
  'egg',
  'nuts',
  'peanut',
  'fish',
  'crustaceans',
  'soy',
  'sesame',
  'celery',
  'mustard',
  'molluscs',
  'sulphites',
  'lupin',
];

export const DIETS: readonly DietCode[] = ['vegetarian', 'vegan', 'pescatarian', 'lactose_free'];

/** Ingredient tags each diet excludes (`diet_excluded_tags`). */
export const DIET_EXCLUDED_TAGS: Record<DietCode, readonly IngredientTag[]> = {
  vegetarian: ['meat', 'pork', 'beef', 'poultry', 'fish', 'seafood'],
  vegan: ['meat', 'pork', 'beef', 'poultry', 'fish', 'seafood', 'egg', 'dairy', 'lactose', 'honey'],
  pescatarian: ['meat', 'pork', 'beef', 'poultry'],
  lactose_free: ['lactose'],
};

export const AISLE_ORDER: readonly AisleCode[] = [
  'produce',
  'bread',
  'meat',
  'fish',
  'dairy',
  'frozen',
  'dry',
  'canned',
  'spices',
];

export const CRAVINGS: readonly CravingCode[] = [
  'chicken',
  'fish',
  'minced',
  'vegetarian',
  'pasta',
  'soup',
  'asian',
  'mexican',
  'quick',
  'oven',
];

/** "Nopea" means at most this many minutes. */
export const QUICK_MAX_MIN = 30;

/** Calorie goal floor (docs/PLAN.md, risks): never suggest or accept less. */
export const MIN_KCAL_GOAL = 1200;

export const DEFAULT_GOALS = { kcal: 2000, proteinG: 100, carbsG: 230, fatG: 70 } as const;
