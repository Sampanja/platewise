import { describe, expect, it } from '@jest/globals';

import { isRecipeAllowed, keywordAllergens, type DietRules } from '@/domain/recipes';
import { testDataPlate } from '@/services/foodRecognitionTestData';

import type { AllergenCode, DietCode, MealType, Recipe } from '../types';
import { DISH_TYPES, MEAL_TYPES } from '../types';
import { FOODS, FOODS_BY_ID, INGREDIENTS, INGREDIENTS_BY_ID, RECIPES } from '.';
import { DIET_EXCLUDED_TAGS } from './reference';

/**
 * Recipe validation. Runs after every recipe batch (`npx jest catalog`):
 * every recipe must pass all of these before it ships.
 */

/** Collects every offender instead of stopping at the first one. */
function offenders(check: (recipe: Recipe) => string | null | false): string[] {
  return RECIPES.map((recipe) => check(recipe) || null).filter((x): x is string => x !== null);
}

const MEAT_PROTEINS = ['chicken', 'beef', 'pork', 'minced_meat'];

describe('recipe library: structure', () => {
  it('has at least 300 recipes', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(300);
  });

  it('has unique ids and unique names', () => {
    const ids = RECIPES.map((r) => r.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    const titles = RECIPES.map((r) => r.title.toLocaleLowerCase('fi').trim());
    expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([]);
  });

  it('has a name, a short description and kebab-case id', () => {
    expect(
      offenders(
        (r) =>
          (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id) ||
            r.title.trim().length < 4 ||
            r.description.trim().length < 20 ||
            r.description.length > 170 ||
            !/[.!]$/.test(r.description)) &&
          r.id,
      ),
    ).toEqual([]);
  });

  it('uses only ingredients from the closed list, each once, with positive grams', () => {
    expect(
      offenders((r) => {
        const ids = r.ingredients.map((i) => i.ingredientId);
        const unknown = ids.filter((id) => !INGREDIENTS_BY_ID[id]);
        if (unknown.length) return `${r.id}: unknown ${unknown.join(', ')}`;
        if (new Set(ids).size !== ids.length) return `${r.id}: duplicate ingredient`;
        if (r.ingredients.some((i) => !(i.grams > 0) || i.grams > 600)) return `${r.id}: grams`;
        return r.ingredients.length < 2 && `${r.id}: too few ingredients`;
      }),
    ).toEqual([]);
  });

  it('has numbered steps written as sentences', () => {
    expect(
      offenders((r) => {
        const min = r.totalTimeMin <= 10 || ['smoothie', 'snack', 'sandwich'].includes(r.dishType) ? 2 : 3;
        if (r.steps.length < min || r.steps.length > 10) return `${r.id}: ${r.steps.length} steps`;
        const bad = r.steps.find((s) => s.trim().length < 10 || !/[.!]$/.test(s) || /^\d/.test(s));
        return bad !== undefined && `${r.id}: "${bad}"`;
      }),
    ).toEqual([]);
  });

  it('has tips, storage and reheating advice', () => {
    expect(
      offenders(
        (r) =>
          (r.tips.length < 1 ||
            r.tips.length > 4 ||
            r.tips.some((t) => t.trim().length < 10 || !/[.!]$/.test(t)) ||
            r.storage.trim().length < 15 ||
            r.reheating.trim().length < 10) &&
          r.id,
      ),
    ).toEqual([]);
  });

  it('has plausible times, difficulty, servings, category and meals', () => {
    expect(
      offenders(
        (r) =>
          (r.activeTimeMin < 1 ||
            r.activeTimeMin > r.totalTimeMin ||
            r.totalTimeMin > 720 ||
            r.servings < 1 ||
            r.servings > 12 ||
            !['easy', 'medium', 'hard'].includes(r.difficulty) ||
            !DISH_TYPES.includes(r.dishType) ||
            r.meals.length === 0 ||
            r.meals.some((m) => !MEAL_TYPES.includes(m)) ||
            new Set(r.meals).size !== r.meals.length) &&
          r.id,
      ),
    ).toEqual([]);
  });

  it('leaves the image to the category card until the backend adds photos', () => {
    expect(offenders((r) => r.imageUrl !== null && !/^https:\/\//.test(r.imageUrl) && r.id)).toEqual([]);
  });
});

describe('recipe library: computed data', () => {
  it('has plausible energy per serving (100–1 500 kcal)', () => {
    expect(
      offenders((r) => (r.perServing.kcal < 100 || r.perServing.kcal > 1500) && `${r.id}: ${r.perServing.kcal} kcal`),
    ).toEqual([]);
  });

  it('gives dinners a meal-sized serving (300–1 300 kcal)', () => {
    expect(
      offenders(
        (r) =>
          r.meals.includes('dinner') &&
          (r.perServing.kcal < 300 || r.perServing.kcal > 1300) &&
          `${r.id}: ${r.perServing.kcal} kcal`,
      ),
    ).toEqual([]);
  });

  it('has macros that add up to the energy', () => {
    expect(
      offenders((r) => {
        const m = r.perServing;
        const fromMacros = m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9 + (m.fiberG ?? 0) * 2;
        return Math.abs(fromMacros - m.kcal) / m.kcal > 0.2 && `${r.id}: ${m.kcal} vs ${Math.round(fromMacros)}`;
      }),
    ).toEqual([]);
  });

  it('derives allergens and diet tags exactly from the ingredients', () => {
    expect(
      offenders((r) => {
        const allergens = new Set(r.ingredients.flatMap((i) => INGREDIENTS_BY_ID[i.ingredientId].allergens));
        const tags = new Set(r.ingredients.flatMap((i) => INGREDIENTS_BY_ID[i.ingredientId].tags));
        const same = (a: Set<string>, b: readonly string[]) => a.size === b.length && b.every((x) => a.has(x));
        return (!same(allergens, r.allergens) || !same(tags, r.tags)) && r.id;
      }),
    ).toEqual([]);
  });

  it('never names an allergen in its text that its ingredients do not contain', () => {
    expect(
      offenders((r) => {
        const named = [...keywordAllergens([r.title, r.description, ...r.steps])];
        const extra = named.filter((code) => !r.allergens.includes(code));
        return extra.length > 0 && `${r.id}: ${extra.join(', ')}`;
      }),
    ).toEqual([]);
  });

  it('has a main protein that matches its ingredients', () => {
    expect(
      offenders((r) => {
        const has = (tag: string) => r.tags.includes(tag as never);
        const ok =
          (MEAT_PROTEINS.includes(r.mainProtein) ? has('meat') : true) &&
          (r.mainProtein === 'chicken' ? has('poultry') : true) &&
          (r.mainProtein === 'fish' ? has('fish') : true) &&
          (r.mainProtein === 'seafood' ? has('seafood') : true) &&
          (r.mainProtein === 'egg' ? has('egg') : true) &&
          (r.mainProtein === 'dairy' ? has('dairy') : true) &&
          (r.mainProtein === 'tofu' ? r.allergens.includes('soy') : true);
        return !ok && `${r.id}: ${r.mainProtein}`;
      }),
    ).toEqual([]);
  });

  it('lives up to diet words in its name', () => {
    const words: [RegExp, DietCode][] = [
      [/vegaan/i, 'vegan'],
      [/kasvis/i, 'vegetarian'],
      [/laktoositon/i, 'lactose_free'],
    ];
    expect(
      offenders((r) => {
        const broken = words.filter(
          ([re, diet]) => re.test(r.title) && DIET_EXCLUDED_TAGS[diet].some((tag) => r.tags.includes(tag)),
        );
        return broken.length > 0 && `${r.id}: ${broken.map(([, d]) => d).join(', ')}`;
      }),
    ).toEqual([]);
    expect(
      offenders((r) => /gluteeniton/i.test(r.title) && r.allergens.includes('gluten') && r.id),
    ).toEqual([]);
  });
});

/**
 * Common allergy and diet combinations. Each must leave enough choice that
 * the planner can fill a week and the library never feels empty.
 */
const COMBOS: [string, AllergenCode[], DietCode[]][] = [
  ['no rules', [], []],
  ['vegetarian', [], ['vegetarian']],
  ['vegan', [], ['vegan']],
  ['pescatarian', [], ['pescatarian']],
  ['lactose-free', [], ['lactose_free']],
  ['milk allergy', ['milk'], []],
  ['gluten-free', ['gluten'], []],
  ['egg allergy', ['egg'], []],
  ['fish allergy', ['fish'], []],
  ['nuts + peanut', ['nuts', 'peanut'], []],
  ['shellfish', ['crustaceans', 'molluscs'], []],
  ['soy allergy', ['soy'], []],
  ['sesame allergy', ['sesame'], []],
  ['gluten + milk', ['gluten', 'milk'], []],
  ['gluten-free vegan', ['gluten'], ['vegan']],
  ['gluten-free vegetarian', ['gluten'], ['vegetarian']],
  ['milk allergy + vegan', ['milk'], ['vegan']],
  ['gluten-free + lactose-free', ['gluten'], ['lactose_free']],
  ['gluten-free pescatarian', ['gluten'], ['pescatarian']],
  ['milk + egg', ['milk', 'egg'], []],
  ['vegan, no soy', ['soy'], ['vegan']],
];

const MIN_PER_MEAL: Record<MealType, number> = { dinner: 25, lunch: 25, breakfast: 6, snack: 5 };

describe('recipe library: choice for every common diet', () => {
  it.each(COMBOS)('%s has enough recipes for every meal', (_, allergens, diets) => {
    const rules: DietRules = { allergens, diets };
    const allowed = RECIPES.filter((r) => isRecipeAllowed(r, rules, INGREDIENTS_BY_ID));
    const short = MEAL_TYPES.map((meal) => [meal, allowed.filter((r) => r.meals.includes(meal)).length] as const).filter(
      ([meal, count]) => count < MIN_PER_MEAL[meal],
    );
    expect(short).toEqual([]);
  });
});

describe('ingredient and food lists', () => {
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
      for (const food of testDataPlate(`file:///photo-${i}.jpg`)) {
        expect(FOODS_BY_ID[food.foodId]).toBeDefined();
      }
    }
  });
});
