import { describe, expect, it } from '@jest/globals';

import { recognizePhoto } from '@/domain/photoRecognition';

import { FOODS, FOODS_BY_ID, INGREDIENTS, INGREDIENTS_BY_ID, RECIPES } from '.';

describe('test catalog', () => {
  it('has at least 40 recipes with unique ids', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length);
  });

  it('uses only ingredients from the closed list', () => {
    for (const recipe of RECIPES) {
      for (const { ingredientId } of recipe.ingredients) {
        expect(INGREDIENTS_BY_ID[ingredientId]).toBeDefined();
      }
    }
  });

  it('gives every recipe an image, steps and plausible dinner macros', () => {
    for (const recipe of RECIPES) {
      expect(recipe.imageUrl).toMatch(/^https:\/\//);
      expect(recipe.steps.length).toBeGreaterThanOrEqual(3);
      expect(recipe.perServing.kcal).toBeGreaterThan(250);
      expect(recipe.perServing.kcal).toBeLessThan(1100);
    }
  });

  it('has unique ingredient ids with positive prices and packages', () => {
    expect(new Set(INGREDIENTS.map((i) => i.id)).size).toBe(INGREDIENTS.length);
    for (const ingredient of INGREDIENTS) {
      expect(ingredient.packageG).toBeGreaterThan(0);
      expect(ingredient.pricePerKgCents).toBeGreaterThan(0);
    }
  });

  it('has about 150 diary foods with unique ids and portions', () => {
    expect(FOODS.length).toBeGreaterThanOrEqual(140);
    expect(new Set(FOODS.map((f) => f.id)).size).toBe(FOODS.length);
    for (const food of FOODS) expect(food.portions.length).toBeGreaterThan(0);
  });

  it('only recognises foods that exist in the food list', () => {
    for (let i = 0; i < 30; i++) {
      for (const food of recognizePhoto(`file:///photo-${i}.jpg`)) {
        expect(FOODS_BY_ID[food.foodId]).toBeDefined();
      }
    }
  });
});
