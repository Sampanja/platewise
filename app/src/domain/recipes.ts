import { DIET_EXCLUDED_TAGS } from '@/data/catalog/reference';
import { ALLERGEN_KEYWORDS } from '@/data/catalog/text/allergenKeywords';
import type { Language } from '@/i18n/languages';
import type {
  AllergenCode,
  DietCode,
  Ingredient,
  IngredientTag,
  Macros,
  Recipe,
  RecipeSource,
} from '@/data/types';
import { MICRO_KEYS } from '@/data/types';

export type IngredientIndex = Readonly<Record<string, Ingredient>>;

export const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

/** Applies fn to the optional micronutrients present in either input. */
function withMicros(result: Macros, inputs: readonly Macros[], fn: (values: (number | undefined)[]) => number): Macros {
  for (const key of MICRO_KEYS) {
    const values = inputs.map((m) => m[key]);
    if (values.some((v) => v !== undefined)) result[key] = fn(values);
  }
  return result;
}

export function addMacros(a: Macros, b: Macros): Macros {
  return withMicros(
    {
      kcal: a.kcal + b.kcal,
      proteinG: a.proteinG + b.proteinG,
      carbsG: a.carbsG + b.carbsG,
      fatG: a.fatG + b.fatG,
    },
    [a, b],
    (values) => values.reduce<number>((sum, v) => sum + (v ?? 0), 0),
  );
}

export function scaleMacros(m: Macros, factor: number): Macros {
  return withMicros(
    {
      kcal: m.kcal * factor,
      proteinG: m.proteinG * factor,
      carbsG: m.carbsG * factor,
      fatG: m.fatG * factor,
    },
    [m],
    ([v]) => (v ?? 0) * factor,
  );
}

export function roundMacros(m: Macros): Macros {
  return withMicros(
    {
      kcal: Math.round(m.kcal),
      proteinG: Math.round(m.proteinG),
      carbsG: Math.round(m.carbsG),
      fatG: Math.round(m.fatG),
    },
    [m],
    ([v]) => Math.round((v ?? 0) * 10) / 10,
  );
}

function ingredientOf(index: IngredientIndex, id: string, recipeId: string): Ingredient {
  const ingredient = index[id];
  // Closed ingredient list: an unknown ingredient rejects the recipe (CLAUDE.md, principle 1).
  if (!ingredient) throw new Error(`Unknown ingredient "${id}" in recipe "${recipeId}"`);
  return ingredient;
}

/**
 * Derives what the backend computes from ingredient data: per-serving macros
 * (deterministically, never from the AI), allergens, diet tags and base cost.
 */
export function deriveRecipe(source: RecipeSource, index: IngredientIndex): Recipe {
  let perServing = ZERO_MACROS;
  const allergens = new Set<AllergenCode>();
  const tags = new Set<IngredientTag>();
  let baseCost = 0;

  for (const { ingredientId, grams } of source.ingredients) {
    const ingredient = ingredientOf(index, ingredientId, source.id);
    perServing = addMacros(perServing, scaleMacros(ingredient.per100g, grams / 100));
    ingredient.allergens.forEach((code) => allergens.add(code));
    ingredient.tags.forEach((tag) => tags.add(tag));
    if (ingredient.pantry !== 'default') {
      baseCost += (grams / 1000) * ingredient.pricePerKgCents;
    }
  }

  return {
    ...source,
    perServing: roundMacros(perServing),
    allergens: [...allergens],
    tags: [...tags],
    baseCostPerServingCents: Math.round(baseCost),
  };
}

export type DietRules = {
  allergens: readonly AllergenCode[];
  diets: readonly DietCode[];
};

export type RecipeCheck = {
  ok: boolean;
  /** The user's allergens the recipe contains (ingredient data or free-text keywords). */
  allergens: AllergenCode[];
  /** The user's diets the recipe breaks. */
  diets: DietCode[];
};

/**
 * Allergens whose keywords appear in free text. Catalog recipes are scanned in
 * their Finnish source text; the other languages' lists check translations
 * (data/catalog/text/allergenKeywords.ts).
 */
export function keywordAllergens(texts: readonly string[], language: Language = 'fi'): Set<AllergenCode> {
  const set = ALLERGEN_KEYWORDS[language];
  const byStart = keywordsByStart(language);
  const found = new Set<AllergenCode>();
  for (const text of texts) {
    const list = words(text);
    for (let i = 0; i < list.length; i++) {
      const word = list[i];
      const candidates = byStart.get(word.slice(0, 2));
      if (!candidates) continue;
      for (const [code, keyword] of candidates) {
        if (found.has(code) || !word.startsWith(keyword)) continue;
        if (set.exceptions[code]?.some((prefix) => word.startsWith(prefix))) continue;
        if (set.notAfter[code]?.includes(list[i - 1] ?? '')) continue;
        if (code === 'gluten' && set.negatesGluten(list[i - 1], list[i - 2])) continue;
        // "soijaton", "glutenfri", "nut-free": the word says the food is free from it.
        if (set.freeFromSuffix.test(word.slice(keyword.length)) || list[i + 1] === 'free') continue;
        found.add(code);
      }
    }
  }
  return found;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-zåäöé]+/g) ?? [];
}

const startIndexes = new Map<Language, ReadonlyMap<string, readonly [AllergenCode, string][]>>();

/** Keywords by their first two letters, so each word is compared only with a few candidates. */
function keywordsByStart(language: Language): ReadonlyMap<string, readonly [AllergenCode, string][]> {
  const cached = startIndexes.get(language);
  if (cached) return cached;
  const map = new Map<string, [AllergenCode, string][]>();
  for (const [code, keywords] of Object.entries(ALLERGEN_KEYWORDS[language].keywords) as [AllergenCode, readonly string[]][]) {
    for (const keyword of keywords) {
      const start = keyword.slice(0, 2);
      map.set(start, [...(map.get(start) ?? []), [code, keyword]]);
    }
  }
  startIndexes.set(language, map);
  return map;
}

/** Everything a recipe contains, from its ingredients and its free text. */
export type RecipeContents = {
  allergens: ReadonlySet<AllergenCode>;
  tags: ReadonlySet<IngredientTag>;
};

/**
 * Per ingredient table, per recipe object. Recipes and ingredients are
 * immutable values, so the contents of a given object never change; caching
 * by object identity is memoisation of a pure function, not a stored summary.
 * Without it every allergy toggle re-scanned the free text of every recipe
 * (≈ 130 ms per pass on a laptop, several passes per tap on a phone).
 */
const contentsCache = new WeakMap<IngredientIndex, WeakMap<RecipeSource, RecipeContents>>();

export function recipeContents(recipe: RecipeSource, index: IngredientIndex): RecipeContents {
  let byRecipe = contentsCache.get(index);
  if (!byRecipe) {
    byRecipe = new WeakMap();
    contentsCache.set(index, byRecipe);
  }
  const cached = byRecipe.get(recipe);
  if (cached) return cached;

  const allergens = new Set<AllergenCode>();
  const tags = new Set<IngredientTag>();
  for (const { ingredientId } of recipe.ingredients) {
    const ingredient = ingredientOf(index, ingredientId, recipe.id);
    ingredient.allergens.forEach((code) => allergens.add(code));
    ingredient.tags.forEach((tag) => tags.add(tag));
  }
  keywordAllergens(recipe.sourceText ?? [recipe.title, recipe.description, ...recipe.steps]).forEach((code) => allergens.add(code));
  const contents = { allergens, tags };
  byRecipe.set(recipe, contents);
  return contents;
}

/**
 * Rule-based allergy and diet check (CLAUDE.md, principle 4). Runs on the
 * recipe's ingredients and free text, never on derived summary fields, so a
 * stale or wrong summary cannot let an allergen through.
 */
export function checkRecipe(
  recipe: RecipeSource,
  index: IngredientIndex,
  rules: DietRules,
): RecipeCheck {
  const { allergens: containedAllergens, tags: containedTags } = recipeContents(recipe, index);
  const allergens = rules.allergens.filter((code) => containedAllergens.has(code));
  const diets = rules.diets.filter((diet) =>
    DIET_EXCLUDED_TAGS[diet].some((tag) => containedTags.has(tag)),
  );
  return { ok: allergens.length === 0 && diets.length === 0, allergens, diets };
}

/**
 * The one gate for showing or suggesting a recipe anywhere in the app:
 * library, search, recommendations, Home, Suunnittele proposals, swap
 * alternatives and chat. A recipe that breaks any of the user's allergies or
 * diets is never shown; there is no "show all" and no hidden count.
 */
export function isRecipeAllowed(recipe: RecipeSource, rules: DietRules, index: IngredientIndex): boolean {
  if (rules.allergens.length === 0 && rules.diets.length === 0) return true;
  return checkRecipe(recipe, index, rules).ok;
}

/** Cost of `servings` servings in a price region (domain/priceRegion.ts `priceFactor`), leaving out the user's pantry staples. */
export function recipeCostCents(
  recipe: RecipeSource,
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
  priceFactor: number,
  servings = 1,
): number {
  let cost = 0;
  for (const { ingredientId, grams } of recipe.ingredients) {
    if (pantry.has(ingredientId)) continue;
    const ingredient = ingredientOf(index, ingredientId, recipe.id);
    cost += (grams / 1000) * ingredient.pricePerKgCents;
  }
  return Math.round(cost * priceFactor * servings);
}
