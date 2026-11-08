import type { Cuisine, DishType, MainProtein, RecipeSource } from '../types';

/** Unsplash photo by id. Ids were checked to match the dish. */
export function unsplash(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=1080&q=80&auto=format&fit=crop`;
}

/** TheMealDB photo by file id (free test images whose dish names match). */
export function mealdb(id: string): string {
  return `https://www.themealdb.com/images/media/meals/${id}.jpg`;
}

type Input = {
  id: string;
  title: string;
  description: string;
  cookTimeMin: number;
  dishType: DishType;
  cuisine: Cuisine;
  mainProtein: MainProtein;
  oven?: boolean;
  goodForLeftovers?: boolean;
  imageUrl: string | null;
  /** [ingredient id, grams per serving] */
  ingredients: [string, number][];
  steps: string[];
};

/** Compact recipe definition for the test catalog. */
export function r(input: Input): RecipeSource {
  return {
    ...input,
    oven: input.oven ?? false,
    goodForLeftovers: input.goodForLeftovers ?? false,
    ingredients: input.ingredients.map(([ingredientId, grams]) => ({ ingredientId, grams })),
  };
}
