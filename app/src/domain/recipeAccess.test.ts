import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from '@/data/catalog';
import { plainDish } from '@/data/catalog/recipeHelpers';
import type { AllergenCode, DietCode, RecipeSource } from '@/data/types';

import { suggestRecipes, testAnswer, type RecipeHint } from './assistantRules';
import { eligibleRecipes } from './generate';
import { filterRecipes } from './recipeFilters';
import { checkRecipe, isRecipeAllowed } from './recipes';
import { recommendRecipes } from './recommend';

/**
 * isRecipeAllowed is the one gate every screen uses. These tests pin it down
 * for the combinations people actually have, including compound words, and
 * check that the library, search, recommendations, the planner and chat all
 * go through it.
 */

const index = INGREDIENTS_BY_ID;
const rules = (allergens: AllergenCode[], diets: DietCode[] = []) => ({ allergens, diets });

function recipe(ing: string, extra: Partial<RecipeSource> = {}): RecipeSource {
  return {
    ...plainDish(
      { id: 'test-dish', cat: 'other', cuisine: 'other', protein: 'none', time: [10, 10], ing },
      { title: 'Testiruoka', description: 'Testikuvaus.', steps: ['Sekoita ainekset.'] },
    ),
    ...extra,
  };
}

describe('isRecipeAllowed: single rules', () => {
  it('allows everything when the user has no rules', () => {
    expect(RECIPES.every((r) => isRecipeAllowed(r, rules([]), index))).toBe(true);
  });

  it('blocks gluten from any grain product', () => {
    for (const id of ['spaghetti', 'rye-bread', 'oats', 'barley', 'bulgur', 'couscous', 'breadcrumbs', 'soy-sauce']) {
      expect(isRecipeAllowed(recipe(`${id} 50, rice 50`), rules(['gluten']), index)).toBe(false);
    }
    for (const id of ['gluten-free-pasta', 'gf-oats', 'gf-bread', 'rice', 'quinoa', 'buckwheat', 'corn-tortilla']) {
      expect(isRecipeAllowed(recipe(`${id} 50, salt 1`), rules(['gluten']), index)).toBe(true);
    }
  });

  it('blocks peanuts and tree nuts separately, also in compound words', () => {
    const pb = recipe('peanut-butter 20, banana 100');
    expect(isRecipeAllowed(pb, rules(['peanut']), index)).toBe(false);
    expect(isRecipeAllowed(pb, rules(['nuts']), index)).toBe(true);
    // The text alone is enough: "maapähkinävoi" in a step blocks it for a peanut allergy.
    const sneaky = recipe('banana 100, oats 30', { steps: ['Lisää lopuksi maapähkinävoita.'] });
    expect(isRecipeAllowed(sneaky, rules(['peanut']), index)).toBe(false);
    const pesto = recipe('pesto 20, penne 80');
    expect(isRecipeAllowed(pesto, rules(['nuts']), index)).toBe(false);
    const almond = recipe('rice 50, salt 1', { title: 'Mantelikala' });
    expect(isRecipeAllowed(almond, rules(['nuts']), index)).toBe(false);
  });

  it('blocks shellfish and molluscs as their own allergens', () => {
    expect(isRecipeAllowed(recipe('shrimp 100, rice 60'), rules(['crustaceans']), index)).toBe(false);
    expect(isRecipeAllowed(recipe('mussels 100, rice 60'), rules(['molluscs']), index)).toBe(false);
    expect(isRecipeAllowed(recipe('mussels 100, rice 60'), rules(['crustaceans']), index)).toBe(true);
  });

  it('treats lactose-free and milk allergy differently', () => {
    const cheese = recipe('cheese 30, penne 80');
    expect(isRecipeAllowed(cheese, rules([], ['lactose_free']), index)).toBe(true);
    expect(isRecipeAllowed(cheese, rules(['milk']), index)).toBe(false);
    const lfMilk = recipe('milk-lactose-free 200, oats 50');
    expect(isRecipeAllowed(lfMilk, rules([], ['lactose_free']), index)).toBe(true);
    expect(isRecipeAllowed(lfMilk, rules(['milk']), index)).toBe(false);
  });
});

describe('isRecipeAllowed: combinations', () => {
  it('milk allergy + vegan: no dairy, egg, honey, meat or fish', () => {
    const r = rules(['milk'], ['vegan']);
    expect(isRecipeAllowed(recipe('chickpeas 100, rice 60, coconut-milk 80'), r, index)).toBe(true);
    for (const bad of ['butter 5', 'honey 5', 'eggs 50', 'salmon 100', 'plain-yogurt 100']) {
      expect(isRecipeAllowed(recipe(`rice 60, ${bad}`), r, index)).toBe(false);
    }
  });

  it('gluten-free + fish: plain fish is fine, breaded fish is not', () => {
    const r = rules(['gluten']);
    expect(isRecipeAllowed(recipe('salmon 120, potato 200'), r, index)).toBe(true);
    expect(isRecipeAllowed(recipe('fish-sticks 120, potato 200'), r, index)).toBe(false);
    expect(isRecipeAllowed(recipe('white-fish 120, breadcrumbs 15'), r, index)).toBe(false);
    expect(isRecipeAllowed(recipe('white-fish 120, gf-breadcrumbs 15'), r, index)).toBe(true);
  });

  it('pescatarian + egg allergy: fish yes, meat and egg no', () => {
    const r = rules(['egg'], ['pescatarian']);
    expect(isRecipeAllowed(recipe('salmon 120, potato 200'), r, index)).toBe(true);
    expect(isRecipeAllowed(recipe('chicken-breast 120, rice 60'), r, index)).toBe(false);
    expect(isRecipeAllowed(recipe('tagliatelle 80, salmon 100'), r, index)).toBe(false);
  });

  it('every library recipe allowed for a combination really passes each rule', () => {
    const combos: [AllergenCode[], DietCode[]][] = [
      [['milk'], ['vegan']],
      [['gluten'], ['pescatarian']],
      [['nuts', 'peanut'], []],
      [['gluten', 'milk', 'egg'], []],
      [['soy', 'sesame'], ['vegetarian']],
    ];
    for (const [allergens, diets] of combos) {
      for (const r of RECIPES.filter((x) => isRecipeAllowed(x, rules(allergens, diets), index))) {
        for (const code of allergens) expect(r.allergens).not.toContain(code);
        for (const diet of diets) expect(checkRecipe(r, index, rules([], [diet])).ok).toBe(true);
      }
    }
  });
});

describe('every surface uses the same gate', () => {
  const vegan = rules(['nuts'], ['vegan']);
  const allowed = (id: string) => isRecipeAllowed(RECIPES_BY_ID[id], vegan, index);

  it('library and search only see allowed recipes', () => {
    const library = RECIPES.filter((r) => isRecipeAllowed(r, vegan, index));
    const found = filterRecipes(library, {
      query: 'curry',
      filters: [],
      sort: 'recommended',
      context: { favoriteIds: [], servingPrice: () => 100 },
      index,
    });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((r) => allowed(r.id))).toBe(true);
  });

  it('recommendations and the planner only pick allowed recipes', () => {
    const recommended = recommendRecipes(RECIPES, index, vegan, ['chicken-curry'], new Set(), 20000, 20);
    expect(recommended.every((r) => allowed(r.id))).toBe(true);
    expect(eligibleRecipes(RECIPES, index, vegan).every((r) => allowed(r.id))).toBe(true);
  });

  it('chat suggests only from the allowed list it is given', () => {
    const hints: RecipeHint[] = RECIPES.filter((r) => isRecipeAllowed(r, vegan, index)).map((r) => ({
      id: r.id,
      title: r.title,
      proteinG: r.perServing.proteinG,
      dinner: r.meals.includes('dinner'),
      legumes: r.mainProtein === 'legumes',
    }));
    const picks = suggestRecipes('Mitä söisin illalla, jossa on proteiinia?', hints);
    expect(picks.length).toBe(3);
    expect(picks.every((p) => allowed(p.id))).toBe(true);
    const answer = testAnswer('Mitä söisin illalla, jossa on proteiinia?', null, hints);
    expect(answer).not.toMatch(/lohi|broileri|rahka|raejuusto|munakas/i);
    // With nothing allowed, the assistant names no dish at all.
    expect(suggestRecipes('proteiinia illalla', [])).toEqual([]);
  });
});
