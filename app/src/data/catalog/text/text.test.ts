import { describe, expect, it } from '@jest/globals';

import { keywordAllergens } from '@/domain/recipes';
import { LANGUAGES, type Language } from '@/i18n/languages';

import { FOODS, INGREDIENTS, RECIPES } from '..';
import { CATALOG_TEXT } from '.';

/**
 * Catalog translations. Text is separate from structure, so these check that
 * every language describes the same recipes, ingredients and foods, and that
 * a translation never names an allergen the recipe does not contain.
 *
 * Languages whose catalog text is complete. A new language is added here
 * when all its batches are translated; from then on every recipe needs it.
 */
const COMPLETE: readonly Language[] = ['fi'];

const recipeIds = new Set(RECIPES.map((r) => r.id));
const ingredientIds = new Set(INGREDIENTS.map((i) => i.id));
const foodIds = new Set(FOODS.map((f) => f.id));

describe.each(LANGUAGES)('catalog text (%s)', (lang) => {
  const text = CATALOG_TEXT[lang];
  const fi = CATALOG_TEXT.fi;

  it('only describes recipes, ingredients and foods that exist', () => {
    expect(Object.keys(text.recipes).filter((id) => !recipeIds.has(id))).toEqual([]);
    expect(Object.keys(text.ingredients).filter((id) => !ingredientIds.has(id))).toEqual([]);
    expect(Object.keys(text.foods).filter((id) => !foodIds.has(id))).toEqual([]);
  });

  if (COMPLETE.includes(lang)) {
    it('has every recipe, ingredient and food', () => {
      expect([...recipeIds].filter((id) => !text.recipes[id])).toEqual([]);
      expect([...ingredientIds].filter((id) => !text.ingredients[id])).toEqual([]);
      expect([...foodIds].filter((id) => !text.foods[id])).toEqual([]);
    });
  }

  it('keeps the shape of the Finnish text', () => {
    const wrong = Object.entries(text.recipes).filter(([id, t]) => {
      const source = fi.recipes[id];
      return (
        !t.title.trim() ||
        !t.description.trim() ||
        t.steps.length !== source.steps.length ||
        t.tips.length !== source.tips.length ||
        t.steps.some((step) => !step.trim()) ||
        (t.storage === undefined) !== (source.storage === undefined) ||
        (t.reheating === undefined) !== (source.reheating === undefined)
      );
    });
    expect(wrong.map(([id]) => id)).toEqual([]);
  });

  it('names pieces, packages and portions like the Finnish text', () => {
    const ingredients = Object.entries(text.ingredients).filter(([id, t]) => {
      const source = fi.ingredients[id];
      return !t.name.trim() || (source.one === undefined) !== (t.one === undefined) || (source.packageLabel === undefined) !== (t.packageLabel === undefined);
    });
    expect(ingredients.map(([id]) => id)).toEqual([]);
    const foods = Object.entries(text.foods).filter(([id, t]) => !t.name.trim() || t.portions.length !== fi.foods[id].portions.length);
    expect(foods.map(([id]) => id)).toEqual([]);
  });

  it('never names an allergen the recipe does not contain', () => {
    const extra = RECIPES.flatMap((recipe) => {
      const t = text.recipes[recipe.id];
      if (!t) return [];
      const named = [...keywordAllergens([t.title, t.description, ...t.steps], lang)];
      const missing = named.filter((code) => !recipe.allergens.includes(code));
      return missing.length > 0 ? [`${recipe.id}: ${missing.join(', ')}`] : [];
    });
    expect(extra).toEqual([]);
  });
});
