import type { DishType } from '../../types';

/**
 * Translatable catalog text, kept apart from the structure (ingredients,
 * amounts, times, categories), which every language shares. Macros,
 * allergens and prices come from the structure only.
 */

export type RecipeText = {
  title: string;
  description: string;
  /** Same number of steps in every language (checked in catalog.test.ts). */
  steps: readonly string[];
  tips: readonly string[];
  /** Overrides the dish type's default storage advice (DishDefaults). */
  storage?: string;
  /** Overrides the dish type's default reheating advice. */
  reheating?: string;
};

export type IngredientText = {
  name: string;
  /** Piece names for ingredients counted in pieces: "1 onion", "2 onions". */
  one?: string;
  many?: string;
  /** Shopping-list package when it is not a weight or volume ("1 pot"). */
  packageLabel?: string;
};

export type FoodText = {
  name: string;
  /** Portion labels in the same order as the food's portions. */
  portions: readonly string[];
};

export type DishDefaults = {
  storage: Readonly<Record<DishType, string>>;
  reheating: Readonly<Record<DishType, string>>;
};

export type CatalogText = {
  recipes: Readonly<Record<string, RecipeText>>;
  ingredients: Readonly<Record<string, IngredientText>>;
  foods: Readonly<Record<string, FoodText>>;
  dishDefaults: DishDefaults;
};
