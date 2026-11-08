import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID, RECIPES } from '@/data/catalog';

import { checkRecipe } from './recipes';
import { daySeed, recommendRecipes } from './recommend';

describe('recommendRecipes', () => {
  const rules = { allergens: ['milk'] as const, diets: [] as const };

  it('only recommends recipes that pass the allergy check and are not excluded', () => {
    const excluded = new Set(['dal']);
    const result = recommendRecipes(RECIPES, INGREDIENTS_BY_ID, { allergens: ['milk'], diets: [] }, [], excluded, 1);
    expect(result).toHaveLength(8);
    for (const recipe of result) {
      expect(checkRecipe(recipe, INGREDIENTS_BY_ID, { allergens: [...rules.allergens], diets: [] }).ok).toBe(true);
      expect(recipe.id).not.toBe('dal');
    }
  });

  it('is stable for a day and leans towards favourites’ main protein', () => {
    const fav = ['salmon-coconut', 'teriyaki-salmon'];
    const a = recommendRecipes(RECIPES, INGREDIENTS_BY_ID, { allergens: [], diets: [] }, fav, new Set(), 9);
    const b = recommendRecipes(RECIPES, INGREDIENTS_BY_ID, { allergens: [], diets: [] }, fav, new Set(), 9);
    expect(a.map((r) => r.id)).toEqual(b.map((r) => r.id));
    expect(a.slice(0, 3).some((r) => r.mainProtein === 'fish')).toBe(true);
  });

  it('derives a day seed from a local date', () => {
    expect(daySeed('2026-11-09') - daySeed('2026-11-08')).toBe(1);
  });
});
