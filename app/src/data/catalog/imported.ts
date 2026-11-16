import { checkRecipe, deriveRecipe, keywordAllergens, type DietRules } from '@/domain/recipes';
import { LANGUAGES } from '@/i18n/languages';

import type { AllergenCode, DietCode, DishType, ImportedRecipe, MainProtein, Recipe, RecipeSource } from '../types';
import { INGREDIENTS_BY_ID } from './ingredients';

/** Imported recipes share recipe ids with nothing in the library. */
export function importedRecipeId(id: string): string {
  return `imp:${id}`;
}

const DISH_WORDS: readonly [RegExp, DishType][] = [
  [/keitto|soup|soppa/i, 'soup'],
  [/salaatti|salad|sallad/i, 'salad'],
  [/pasta|spaget|spaghetti|lasagne|penne|makaroni|nood|nuudel/i, 'pasta'],
  [/riisi|rice|ris\b|risotto/i, 'rice'],
  [/pata|stew|gryta|chili|curry/i, 'stew'],
  [/laatikko|vuoka|casserole|gratäng|gratin|låda/i, 'casserole'],
  [/piirakka|pie|paj|quiche/i, 'pie'],
  [/puuro|porridge|gröt/i, 'porridge'],
  [/pannukakku|pancake|lettu|pannkak/i, 'pancake'],
  [/smoothie/i, 'smoothie'],
  [/wok|stir/i, 'stir_fry'],
  [/burger|pihvi|patty|biff/i, 'patty'],
];

/** The category illustration of an imported recipe (page images are never stored). */
function guessDishType(title: string): DishType {
  return DISH_WORDS.find(([pattern]) => pattern.test(title))?.[1] ?? 'other';
}

function guessProtein(ingredientIds: readonly string[]): MainProtein {
  const tags = new Set(ingredientIds.flatMap((id) => INGREDIENTS_BY_ID[id]?.tags ?? []));
  if (tags.has('fish')) return 'fish';
  if (tags.has('seafood')) return 'seafood';
  if (tags.has('poultry')) return 'chicken';
  if (tags.has('beef')) return 'beef';
  if (tags.has('pork')) return 'pork';
  if (tags.has('meat')) return 'minced_meat';
  if (tags.has('egg')) return 'egg';
  return 'none';
}

const cache = new WeakMap<ImportedRecipe, Recipe>();

/**
 * An imported recipe as a library-style Recipe, so macros, nutrients,
 * quality, allergens and the price estimate are computed exactly as for
 * every other recipe: from the matched ingredients (per serving). Lines not
 * matched to the ingredient table are left out of the numbers.
 */
export function importedAsRecipe(imported: ImportedRecipe): Recipe {
  const cached = cache.get(imported);
  if (cached) return cached;
  const servings = Math.max(1, imported.servings);
  const matched = imported.ingredients.filter(
    (i): i is typeof i & { ingredientId: string; grams: number } => i.ingredientId !== null && INGREDIENTS_BY_ID[i.ingredientId] !== undefined && (i.grams ?? 0) > 0,
  );
  const source: RecipeSource = {
    id: importedRecipeId(imported.id),
    title: imported.title,
    description: '',
    activeTimeMin: imported.activeTimeMin ?? imported.totalTimeMin ?? 30,
    totalTimeMin: imported.totalTimeMin ?? imported.activeTimeMin ?? 30,
    difficulty: 'medium',
    servings,
    dishType: guessDishType(imported.title),
    meals: ['dinner'],
    cuisine: 'other',
    mainProtein: guessProtein(matched.map((i) => i.ingredientId)),
    oven: false,
    goodForLeftovers: false,
    imageUrl: null,
    ingredients: matched.map((i) => ({ ingredientId: i.ingredientId, grams: i.grams / servings })),
    steps: imported.steps,
    tips: [],
    storage: '',
    reheating: '',
    sourceText: [imported.title, ...imported.ingredients.map((i) => i.line), ...imported.steps],
  };
  const recipe = deriveRecipe(source, INGREDIENTS_BY_ID);
  cache.set(imported, recipe);
  return recipe;
}

export type ImportWarnings = { allergens: AllergenCode[]; diets: DietCode[] };

/**
 * The user's allergens and diets an imported recipe breaks. Unlike library
 * recipes it is shown anyway (the user brought it), with a clear warning.
 * The keyword scan reads every line in every language, also lines that were
 * not matched to an ingredient, so "pähkinöitä" or "walnuts" is never missed.
 */
export function importWarnings(imported: ImportedRecipe, rules: DietRules): ImportWarnings {
  const recipe = importedAsRecipe(imported);
  const check = checkRecipe(recipe, INGREDIENTS_BY_ID, rules);
  const texts = recipe.sourceText ?? [];
  const found = new Set<AllergenCode>(check.allergens);
  for (const language of LANGUAGES) {
    for (const code of keywordAllergens(texts, language)) if (rules.allergens.includes(code)) found.add(code);
  }
  return { allergens: [...found], diets: check.diets };
}
