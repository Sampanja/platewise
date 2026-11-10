import { DIET_EXCLUDED_TAGS } from '@/data/catalog/reference';
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
 * Free-text keywords per allergen (`allergen_keywords`). A word matches when it
 * starts with the keyword, so "katkaravut" matches "katkara". Kept narrow on
 * purpose: ingredient data is the primary source and catches compound words.
 */
export const ALLERGEN_KEYWORDS: Readonly<Partial<Record<AllergenCode, readonly string[]>>> = {
  gluten: ['vehnä', 'ruis', 'ohra', 'spelt', 'seitan', 'korppujauho'],
  milk: ['maito', 'kerma', 'juusto', 'jogurtti', 'rahka', 'parmesaani', 'feta', 'mozzarella', 'halloumi'],
  egg: ['kananmun', 'muna'],
  fish: ['kala', 'lohi', 'seiti', 'tonnikala', 'turska', 'silakka', 'muikku', 'anjovis'],
  crustaceans: ['katkara', 'rapu', 'hummeri'],
  molluscs: ['simpuk', 'mustekala', 'kalmari', 'osteri'],
  peanut: ['maapähkinä'],
  nuts: ['pähkinä', 'manteli', 'cashew', 'hasselpähkinä', 'saksanpähkinä', 'pistaasi', 'pekaani'],
  soy: ['soija', 'tofu', 'edamame'],
  sesame: ['seesam', 'tahini'],
  mustard: ['sinappi'],
  celery: ['selleri'],
  lupin: ['lupiini'],
};

/** Word beginnings that start with a keyword but are not the allergen (any inflection). */
const KEYWORD_EXCEPTIONS: readonly string[] = ['juustokumin', 'kookosmai', 'munakois'];

/** "soijaton", "pähkinätön", "munattomat": the word says the food is free from it. */
const FREE_FROM_SUFFIX = /^(ton|tön|ttom|ttöm)/;

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-zåäöé]+/g) ?? [];
}

/** "gluteeniton korppujauho", "gluteenittomat jauhot": the gluten keyword is negated. */
function negatesGluten(previous: string | undefined): boolean {
  return previous !== undefined && previous.startsWith('gluteenit');
}

/** Allergens whose keywords appear in the recipe's free text. */
export function keywordAllergens(texts: readonly string[]): Set<AllergenCode> {
  const found = new Set<AllergenCode>();
  for (const text of texts) {
    const list = words(text);
    list.forEach((word, i) => {
      if (KEYWORD_EXCEPTIONS.some((prefix) => word.startsWith(prefix))) return;
      for (const [code, keywords] of Object.entries(ALLERGEN_KEYWORDS) as [AllergenCode, string[]][]) {
        if (code === 'gluten' && negatesGluten(list[i - 1])) continue;
        if (keywords.some((keyword) => word.startsWith(keyword) && !FREE_FROM_SUFFIX.test(word.slice(keyword.length))))
          found.add(code);
      }
    });
  }
  return found;
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
  const containedAllergens = new Set<AllergenCode>();
  const containedTags = new Set<IngredientTag>();

  for (const { ingredientId } of recipe.ingredients) {
    const ingredient = ingredientOf(index, ingredientId, recipe.id);
    ingredient.allergens.forEach((code) => containedAllergens.add(code));
    ingredient.tags.forEach((tag) => containedTags.add(tag));
  }
  keywordAllergens([recipe.title, recipe.description, ...recipe.steps]).forEach((code) =>
    containedAllergens.add(code),
  );

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

/** Chain-adjusted cost of `servings` servings, leaving out the user's pantry staples. */
export function recipeCostCents(
  recipe: RecipeSource,
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
  priceMultiplier: number,
  servings = 1,
): number {
  let cost = 0;
  for (const { ingredientId, grams } of recipe.ingredients) {
    if (pantry.has(ingredientId)) continue;
    const ingredient = ingredientOf(index, ingredientId, recipe.id);
    cost += (grams / 1000) * ingredient.pricePerKgCents;
  }
  return Math.round(cost * priceMultiplier * servings);
}
