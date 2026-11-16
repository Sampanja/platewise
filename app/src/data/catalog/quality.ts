import { combine, qualityScore, type QualityScore, type WeightedFood } from '@/domain/qualityScore';

import type { Food, Ingredient, Recipe } from '../types';
import { INGREDIENTS_BY_ID } from './ingredients';

/**
 * Ingredients that count as vegetables, fruit, berries, pulses or nuts for the
 * quality score (as in Nutri-Score: potatoes, starches, jams and sauces do
 * not). A reviewed list: a new ingredient is added here when it qualifies.
 */
export const FRUIT_VEG_IDS: ReadonlySet<string> = new Set([
  // produce (not potatoes)
  'apple', 'avocado', 'banana', 'basil', 'beetroot', 'bell-pepper', 'broccoli', 'brussels-sprouts', 'cabbage', 'carrot',
  'cauliflower', 'celeriac', 'chanterelle', 'cherry-tomato', 'chili', 'chives', 'coriander', 'cucumber', 'dill', 'eggplant',
  'garlic', 'ginger', 'iceberg', 'kale', 'leek', 'lemon', 'lime', 'mushroom', 'onion', 'orange', 'parsley', 'parsnip', 'pear',
  'pumpkin', 'radish', 'red-onion', 'salad-mix', 'spinach', 'spring-onion', 'sugar-snap', 'swede', 'tomato', 'turnip', 'zucchini',
  // frozen
  'blueberry', 'corn-frozen', 'fava-beans', 'forest-mushroom', 'green-beans', 'lingonberry-fresh', 'mango', 'peas', 'raspberry',
  'soup-veg', 'strawberry', 'wok-veg',
  // pulses and nuts
  'almonds', 'cashews', 'green-lentils', 'peanuts', 'red-lentils', 'split-peas', 'walnuts',
  // canned
  'black-beans', 'chickpeas', 'corn', 'crushed-tomatoes', 'kidney-beans', 'lingonberry', 'olives', 'pickled-beetroot',
  'roasted-pepper', 'sauerkraut', 'sun-dried-tomatoes', 'white-beans',
]);

/** Diary food categories that are vegetables or fruit. */
const FRUIT_VEG_FOOD_CATEGORIES = new Set<Food['category']>(['produce', 'fruit']);
/** Drinks with no energy count as water (always A). */
const WATER_KCAL = 5;

function ingredientFoods(recipe: Pick<Recipe, 'ingredients'>): WeightedFood[] {
  return recipe.ingredients
    .map(({ ingredientId, grams }) => {
      const ingredient: Ingredient | undefined = INGREDIENTS_BY_ID[ingredientId];
      return ingredient ? { grams, per100g: ingredient.per100g, fruitVegPct: FRUIT_VEG_IDS.has(ingredientId) ? 100 : 0 } : null;
    })
    .filter((item): item is WeightedFood => item !== null);
}

const recipeCache = new WeakMap<object, QualityScore | null>();

/** A recipe's score from its ingredients (one serving's mix). Cached per recipe object. */
export function recipeQuality(recipe: Pick<Recipe, 'ingredients'>): QualityScore | null {
  if (recipeCache.has(recipe)) return recipeCache.get(recipe) ?? null;
  const mix = combine(ingredientFoods(recipe));
  const score = mix ? qualityScore(mix) : null;
  recipeCache.set(recipe, score);
  return score;
}

/** Share (0–100) of vegetables, fruit, pulses and nuts in a recipe, for mixing into a day. */
export function recipeFruitVegPct(recipe: Pick<Recipe, 'ingredients'>): number {
  const foods = ingredientFoods(recipe);
  const total = foods.reduce((sum, f) => sum + f.grams, 0);
  return total > 0 ? foods.reduce((sum, f) => sum + f.fruitVegPct * f.grams, 0) / total : 0;
}

/** A diary food's score: Open Food Facts' Nutri-Score is not used here (see productQuality). */
export function foodQuality(food: Pick<Food, 'per100g' | 'category'>): QualityScore {
  const drink = food.category === 'drink';
  return qualityScore({
    per100g: food.per100g,
    fruitVegPct: FRUIT_VEG_FOOD_CATEGORIES.has(food.category) ? 100 : 0,
    drink,
    water: drink && food.per100g.kcal < WATER_KCAL && (food.per100g.sugarG ?? 0) === 0,
  });
}

export function foodFruitVegPct(food: Pick<Food, 'category'>): number {
  return FRUIT_VEG_FOOD_CATEGORIES.has(food.category) ? 100 : 0;
}
