import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID } from '@/data/catalog/ingredients';
import { plainDish } from '@/data/catalog/recipeHelpers';

import { buildShoppingList, groupByAisle } from './shoppingList';

const index = INGREDIENTS_BY_ID;

function dish(id: string, ingredients: [string, number][]) {
  return {
    ...plainDish({ id, cat: 'other', cuisine: 'other', protein: 'none', time: [10, 10], ing: '' }, { title: id }),
    ingredients: ingredients.map(([ingredientId, grams]) => ({ ingredientId, grams })),
  };
}

describe('buildShoppingList', () => {
  it('merges the same ingredient across recipes', () => {
    const list = buildShoppingList(
      [
        { recipe: dish('a', [['chicken-breast', 150]]), servings: 2 },
        { recipe: dish('b', [['chicken-breast', 100]]), servings: 2 },
      ],
      index,
      new Set(),
      1,
    );
    expect(list.items).toHaveLength(1);
    expect(list.items[0].grams).toBe(500);
    // 500 g needs two 400 g packages
    expect(list.items[0].packages).toBe(2);
    expect(list.items[0].costCents).toBe(Math.round(0.8 * 1350));
  });

  it('buys at least one package and does not add one for float noise', () => {
    const list = buildShoppingList(
      [{ recipe: dish('a', [['cherry-tomato', 83.3333333]]), servings: 3 }],
      index,
      new Set(),
      1,
    );
    expect(list.items[0].packages).toBe(1);
  });

  it('lists pantry staples apart and keeps them out of the total', () => {
    const list = buildShoppingList(
      [{ recipe: dish('a', [['rice', 75], ['oil', 10], ['salt', 1]]), servings: 2 }],
      index,
      new Set(['oil', 'salt']),
      1,
    );
    expect(list.items.map((i) => i.ingredientId)).toEqual(['rice']);
    expect(list.pantryItems.map((i) => i.ingredientId).sort()).toEqual(['oil', 'salt']);
    expect(list.totalCents).toBe(list.items[0].costCents);
  });

  it('applies the region price factor to package prices', () => {
    const entries = [{ recipe: dish('a', [['penne', 100]]), servings: 2 }];
    const finland = buildShoppingList(entries, index, new Set(), 1).totalCents;
    const cheaper = buildShoppingList(entries, index, new Set(), 0.85).totalCents;
    expect(cheaper).toBe(Math.round(finland * 0.85));
  });

  it('sorts items in store walking order', () => {
    const list = buildShoppingList(
      [{ recipe: dish('a', [['soy-sauce', 10], ['salmon', 100], ['onion', 50]]), servings: 1 }],
      index,
      new Set(),
      1,
    );
    expect(list.items.map((i) => i.ingredientId)).toEqual(['onion', 'salmon', 'soy-sauce']);
    expect(groupByAisle(list.items, index).map((g) => g.aisle)).toEqual(['produce', 'fish', 'spices']);
  });

  it('returns an empty list for no recipes', () => {
    expect(buildShoppingList([], index, new Set(), 1)).toEqual({ items: [], pantryItems: [], totalCents: 0 });
  });
});
