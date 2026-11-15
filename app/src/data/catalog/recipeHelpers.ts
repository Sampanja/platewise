import type { Cuisine, Difficulty, DishType, MainProtein, MealType, RecipeSource } from '../types';

import { recipeSourceText, withRecipeText } from './text';

/** Breakfast and snack categories; everything else is lunch and dinner by default. */
const DEFAULT_MEALS: Partial<Record<DishType, MealType[]>> = {
  porridge: ['breakfast'],
  smoothie: ['breakfast', 'snack'],
  snack: ['snack'],
  sandwich: ['breakfast', 'lunch'],
  pancake: ['breakfast', 'snack'],
};

/**
 * A recipe's structure: everything every language shares. The title,
 * description, steps, tips and storage advice are text in
 * text/<lang>/recipesNN.ts, keyed by the id.
 */
export type DishInput = {
  id: string;
  cat: DishType;
  cuisine: Cuisine;
  protein: MainProtein;
  /** Omitted → by category: breakfast/snack categories or lunch + dinner. */
  meals?: MealType[];
  /** [hands-on minutes, total minutes] */
  time: [number, number];
  level?: Difficulty;
  /** Servings the recipe is written for (default 4). Ingredients are per serving. */
  serves?: number;
  oven?: boolean;
  leftovers?: boolean;
  /** "ingredient-id grams, ingredient-id grams, …" per serving. */
  ing: string;
};

/** Parses "salmon 120, potato 200" into ingredient lines. */
export function parseIngredients(text: string, recipeId: string): { ingredientId: string; grams: number }[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^([a-z0-9-]+)\s+(\d+(?:\.\d+)?)$/.exec(part);
      if (!match) throw new Error(`Recipe ${recipeId}: cannot read ingredient "${part}"`);
      return { ingredientId: match[1], grams: Number(match[2]) };
    });
}

/**
 * Builds a recipe from its structure. The display text is attached as getters
 * that read the active language; `sourceText` is the Finnish text the
 * allergen keyword scan reads. Images are null: the app draws a category
 * illustration card until the backend adds a photo.
 */
export function dish(input: DishInput): RecipeSource {
  const recipe = {
    ...structure(input),
    sourceText: recipeSourceText(input.id),
  } as unknown as RecipeSource; // the text fields are added as getters
  return withRecipeText(recipe);
}

function structure(input: DishInput) {
  return {
    id: input.id,
    activeTimeMin: input.time[0],
    totalTimeMin: input.time[1],
    difficulty: input.level ?? 'easy',
    servings: input.serves ?? 4,
    dishType: input.cat,
    meals: input.meals ?? DEFAULT_MEALS[input.cat] ?? ['lunch', 'dinner'],
    cuisine: input.cuisine,
    mainProtein: input.protein,
    oven: input.oven ?? false,
    goodForLeftovers: input.leftovers ?? false,
    imageUrl: null,
    ingredients: parseIngredients(input.ing, input.id),
  };
}

/** A recipe with its own text in plain fields, not from the catalog text (tests, user-made recipes). */
export function plainDish(
  input: DishInput,
  text: { title: string; description?: string; steps?: string[]; tips?: string[] },
): RecipeSource {
  return {
    ...structure(input),
    title: text.title,
    description: text.description ?? '',
    steps: text.steps ?? [],
    tips: text.tips ?? [],
    storage: '',
    reheating: '',
  };
}
