import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID, RECIPES } from '@/data/catalog';
import { DEFAULT_PANTRY } from '@/data/catalog/ingredients';

import { filterRecipes, matchesSearch } from './recipeFilters';
import { recipeCostCents } from './recipes';

const pantry = new Set(DEFAULT_PANTRY);
const context = {
  favoriteIds: ['dal', 'pea-soup'],
  servingPrice: (recipe: (typeof RECIPES)[number]) => recipeCostCents(recipe, INGREDIENTS_BY_ID, pantry, 1),
};

function run(options: Partial<Parameters<typeof filterRecipes>[1]>) {
  return filterRecipes(RECIPES, {
    query: '',
    filters: [],
    sort: 'recommended',
    context,
    index: INGREDIENTS_BY_ID,
    ...options,
  });
}

describe('filterRecipes', () => {
  it('returns everything without filters', () => {
    expect(run({})).toHaveLength(RECIPES.length);
  });

  it('combines filters with AND', () => {
    const result = run({ filters: ['soup', 'vegetarian'] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.dishType === 'soup' && !r.tags.includes('meat'))).toBe(true);
  });

  it('filters favourites', () => {
    expect(run({ filters: ['favorites'] }).map((r) => r.id).sort()).toEqual(['dal', 'pea-soup']);
  });

  it('sorts by price, time and kcal ascending', () => {
    const byTime = run({ sort: 'time' }).map((r) => r.totalTimeMin);
    expect(byTime).toEqual([...byTime].sort((a, b) => a - b));
    const byPrice = run({ sort: 'price' }).map(context.servingPrice);
    expect(byPrice).toEqual([...byPrice].sort((a, b) => a - b));
  });
});

describe('matchesSearch', () => {
  const curry = RECIPES.find((r) => r.id === 'chicken-curry');
  it('finds by title words and ingredient names, case-insensitively', () => {
    expect(curry && matchesSearch(curry, 'KANA', INGREDIENTS_BY_ID)).toBe(true);
    expect(curry && matchesSearch(curry, 'kookosmaito', INGREDIENTS_BY_ID)).toBe(true);
    expect(curry && matchesSearch(curry, 'kana lohi', INGREDIENTS_BY_ID)).toBe(false);
  });
});
