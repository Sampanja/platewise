import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID } from '@/data/catalog/ingredients';
import { r } from '@/data/catalog/recipeHelpers';
import type { RecipeSource } from '@/data/types';

import { checkRecipe, deriveRecipe, keywordAllergens, recipeCostCents } from './recipes';

const index = INGREDIENTS_BY_ID;

function recipe(ingredients: [string, number][], extra: Partial<RecipeSource> = {}): RecipeSource {
  return {
    ...r({
      id: 'test',
      title: 'Testiruoka',
      description: '',
      cookTimeMin: 20,
      dishType: 'other',
      cuisine: 'other',
      mainProtein: 'none',
      imageUrl: null,
      ingredients,
      steps: ['Sekoita.'],
    }),
    ...extra,
  };
}

const NO_RULES = { allergens: [], diets: [] } as const;

describe('deriveRecipe', () => {
  it('computes per-serving macros from grams and per-100 g values', () => {
    const derived = deriveRecipe(recipe([['chicken-breast', 200], ['rice', 100]]), index);
    // Fineli values: 200 g chicken = 2 × per 100 g, 100 g rice = 1 × per 100 g.
    const chicken = index['chicken-breast'].per100g;
    const rice = index.rice.per100g;
    expect(derived.perServing.kcal).toBe(Math.round(chicken.kcal * 2 + rice.kcal));
    expect(derived.perServing.proteinG).toBe(Math.round(chicken.proteinG * 2 + rice.proteinG));
  });

  it('collects allergens and diet tags from ingredients', () => {
    const derived = deriveRecipe(recipe([['penne', 100], ['cream', 50], ['bacon', 30]]), index);
    expect([...derived.allergens].sort()).toEqual(['gluten', 'milk']);
    expect(derived.tags).toEqual(expect.arrayContaining(['pork', 'dairy', 'lactose']));
  });

  it('leaves default pantry staples out of the base cost', () => {
    const withOil = deriveRecipe(recipe([['rice', 100], ['oil', 20], ['salt', 2]]), index);
    const without = deriveRecipe(recipe([['rice', 100]]), index);
    expect(withOil.baseCostPerServingCents).toBe(without.baseCostPerServingCents);
  });

  it('rejects a recipe with an ingredient outside the closed list', () => {
    expect(() => deriveRecipe(recipe([['unicorn-meat', 100]]), index)).toThrow(/Unknown ingredient/);
  });
});

describe('checkRecipe', () => {
  it('passes a recipe without the user’s allergens', () => {
    const result = checkRecipe(recipe([['rice', 80], ['chickpeas', 100]]), index, {
      allergens: ['milk', 'gluten'],
      diets: [],
    });
    expect(result).toEqual({ ok: true, allergens: [], diets: [] });
  });

  it('rejects by ingredient allergen data', () => {
    const result = checkRecipe(recipe([['spaghetti', 100]]), index, { allergens: ['gluten'], diets: [] });
    expect(result.ok).toBe(false);
    expect(result.allergens).toEqual(['gluten']);
  });

  it('rejects hidden allergens in compound ingredients (pesto has nuts and milk)', () => {
    const result = checkRecipe(recipe([['pesto', 30]]), index, { allergens: ['nuts'], diets: [] });
    expect(result.allergens).toEqual(['nuts']);
  });

  it('rejects by free-text keywords even when ingredient data misses them', () => {
    const sneaky = recipe([['rice', 80]], { steps: ['Ripottele pinnalle cashewpähkinöitä.'] });
    expect(checkRecipe(sneaky, index, { allergens: ['nuts'], diets: [] }).ok).toBe(false);
  });

  it('does not treat cumin or coconut milk as milk', () => {
    const vegan = recipe([['chickpeas', 100], ['coconut-milk', 80], ['cumin', 2]], {
      steps: ['Lisää juustokumina ja kookosmaito.'],
    });
    expect(checkRecipe(vegan, index, { allergens: ['milk'], diets: ['vegan'] }).ok).toBe(true);
  });

  it('applies vegetarian, vegan, pescatarian and lactose-free rules by tags', () => {
    const fish = recipe([['salmon', 120]]);
    expect(checkRecipe(fish, index, { allergens: [], diets: ['vegetarian'] }).diets).toEqual(['vegetarian']);
    expect(checkRecipe(fish, index, { allergens: [], diets: ['pescatarian'] }).ok).toBe(true);

    const eggs = recipe([['eggs', 120]]);
    expect(checkRecipe(eggs, index, { allergens: [], diets: ['vegetarian'] }).ok).toBe(true);
    expect(checkRecipe(eggs, index, { allergens: [], diets: ['vegan'] }).ok).toBe(false);

    const cheese = recipe([['cheese', 30]]);
    expect(checkRecipe(cheese, index, { allergens: [], diets: ['lactose_free'] }).ok).toBe(true);
    const cream = recipe([['cream', 50]]);
    expect(checkRecipe(cream, index, { allergens: [], diets: ['lactose_free'] }).ok).toBe(false);
  });

  it('checks pantry staples too (flour at home still contains gluten)', () => {
    const result = checkRecipe(recipe([['wheat-flour', 10]]), index, { allergens: ['gluten'], diets: [] });
    expect(result.ok).toBe(false);
  });

  it('reports every matching rule, not just the first', () => {
    const result = checkRecipe(recipe([['shrimp', 100], ['spaghetti', 100]]), index, {
      allergens: ['gluten', 'crustaceans', 'egg'],
      diets: ['vegetarian'],
    });
    expect(result.allergens.sort()).toEqual(['crustaceans', 'gluten']);
    expect(result.diets).toEqual(['vegetarian']);
  });

  it('passes everything when the user has no rules', () => {
    expect(checkRecipe(recipe([['shrimp', 100]]), index, NO_RULES).ok).toBe(true);
  });
});

describe('keywordAllergens', () => {
  it('matches word beginnings, case-insensitively', () => {
    expect([...keywordAllergens(['Katkaravut ja SEESAMI'])].sort()).toEqual(['crustaceans', 'sesame']);
  });

  it('ignores listed false friends', () => {
    expect(keywordAllergens(['juustokumina', 'kookosmaito']).size).toBe(0);
  });
});

describe('recipeCostCents', () => {
  it('scales with servings and the chain multiplier and skips pantry items', () => {
    const dish = recipe([['chicken-breast', 100], ['oil', 10]]);
    const pantry = new Set(['oil']);
    const one = recipeCostCents(dish, index, pantry, 1);
    expect(one).toBe(135); // 0.1 kg × 13.50 €/kg
    expect(recipeCostCents(dish, index, pantry, 0.85, 2)).toBe(Math.round(270 * 0.85));
    expect(recipeCostCents(dish, index, new Set(), 1)).toBeGreaterThan(one);
  });
});
