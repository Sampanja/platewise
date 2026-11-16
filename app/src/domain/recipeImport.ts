import type { Ingredient } from '@/data/types';

import { splitFoodText, type FoodPhrase } from './foodText';

/**
 * Recipe import from a web page (Reseptit → Omat → "Tuo linkistä"). Pure and
 * unit tested (recipeImport.test.ts):
 * - the schema.org/Recipe JSON-LD a page publishes (name, yield, ingredients,
 *   steps, times), also inside @graph and arrays;
 * - ingredient lines ("2 dl kermaa", "400 g minced beef") to amounts in grams
 *   for an ingredient from the closed ingredient table.
 * Pages without JSON-LD are read by the model in the backend phase
 * (services/recipeImport.ts); until then the user types the recipe in.
 */

export type RecipeDraft = {
  title: string;
  servings: number;
  totalTimeMin: number | null;
  activeTimeMin: number | null;
  /** Ingredient lines as written on the page. */
  ingredientLines: string[];
  steps: string[];
};

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const isObject = (value: Json | undefined): value is { [key: string]: Json } =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

/** Plain text from a JSON-LD string that may hold HTML. */
function clean(text: string): string {
  return decodeEntities(text.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** ISO 8601 duration ("PT1H30M", "P0DT45M") to minutes; null when missing or unreadable. */
export function parseIsoDuration(value: Json | undefined): number | null {
  if (typeof value !== 'string') return null;
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(value.trim());
  if (!match) return null;
  const minutes = Number(match[1] ?? 0) * 1440 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0) + Math.round(Number(match[4] ?? 0) / 60);
  return minutes > 0 ? minutes : null;
}

/** "4", "4 annosta", ["4", "4 servings"], 4 → 4; unknown → 4 (a sensible default the user can change). */
export function parseYield(value: Json | undefined): number {
  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    const number = typeof item === 'number' ? item : typeof item === 'string' ? Number(/\d+/.exec(item)?.[0]) : NaN;
    if (Number.isFinite(number) && number >= 1 && number <= 50) return Math.round(number);
  }
  return 4;
}

function textsOf(value: Json | undefined): string[] {
  if (typeof value === 'string') return clean(value) ? [clean(value)] : [];
  if (Array.isArray(value)) return value.flatMap(textsOf);
  if (isObject(value)) {
    // HowToSection holds steps in itemListElement; HowToStep has text or name.
    if (value.itemListElement !== undefined) return textsOf(value.itemListElement);
    if (typeof value.text === 'string') return textsOf(value.text);
    if (typeof value.name === 'string') return textsOf(value.name);
  }
  return [];
}

/** Instructions given as one block of text are split into steps by lines or sentences. */
function stepsOf(value: Json | undefined): string[] {
  const steps = textsOf(value);
  if (steps.length === 1 && steps[0].length > 200) {
    return steps[0].split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ0-9])/).map((s) => s.trim()).filter(Boolean);
  }
  return steps;
}

function hasRecipeType(node: { [key: string]: Json }): boolean {
  const type = node['@type'];
  return type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));
}

function findRecipe(node: Json | undefined): { [key: string]: Json } | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipe(item);
      if (found) return found;
    }
    return null;
  }
  if (!isObject(node)) return null;
  if (hasRecipeType(node)) return node;
  return findRecipe(node['@graph']) ?? findRecipe(node.mainEntity);
}

/** The first schema.org Recipe in a page's JSON-LD blocks, or null. */
export function extractRecipeFromHtml(html: string): RecipeDraft | null {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  for (const block of blocks) {
    let parsed: Json;
    try {
      parsed = JSON.parse(block.trim()) as Json;
    } catch {
      continue;
    }
    const recipe = findRecipe(parsed);
    if (!recipe) continue;
    const title = typeof recipe.name === 'string' ? clean(recipe.name) : '';
    const ingredientLines = textsOf(recipe.recipeIngredient ?? recipe.ingredients);
    if (!title || ingredientLines.length === 0) continue;
    const prep = parseIsoDuration(recipe.prepTime);
    const cook = parseIsoDuration(recipe.cookTime);
    const total = parseIsoDuration(recipe.totalTime) ?? (prep !== null || cook !== null ? (prep ?? 0) + (cook ?? 0) : null);
    return {
      title,
      servings: parseYield(recipe.recipeYield),
      totalTimeMin: total,
      activeTimeMin: prep,
      ingredientLines,
      steps: stepsOf(recipe.recipeInstructions),
    };
  }
  return null;
}

/** Grams (or ml, density ~1) per unit for recipe lines. A recipe cup is 2.4 dl. */
const RECIPE_UNIT_GRAMS: Readonly<Record<string, number>> = { g: 1, kg: 1000, ml: 1, dl: 100, l: 1000, tbsp: 15, tsp: 5, cup: 240, glass: 200 };

export type IngredientAmount = {
  phrase: FoodPhrase;
  /** Grams for the whole recipe; null when the line gives no usable amount. */
  totalGrams: number | null;
};

/** The amount phrases of one ingredient line ("suolaa ja pippuria" gives two). */
export function ingredientPhrases(line: string): FoodPhrase[] {
  // Text in parentheses ("(noin 400 g)") and after a comma ("sipuli, hienonnettuna") is detail, not food.
  const main = line.replace(/\([^)]*\)/g, ' ').split(',')[0];
  return splitFoodText(main);
}

/**
 * Grams for a matched ingredient: weights and volumes directly, pieces from
 * the ingredient's piece weight, and a plain count of a piece food too.
 * A line without an amount ("suolaa") gives null and the review asks for it.
 */
export function ingredientGrams(phrase: FoodPhrase, ingredient: Ingredient, hasNumber: boolean): number | null {
  if (phrase.unit && RECIPE_UNIT_GRAMS[phrase.unit] !== undefined) return Math.round(phrase.quantity * RECIPE_UNIT_GRAMS[phrase.unit]);
  if (ingredient.display.kind === 'piece' && (phrase.unit === 'piece' || phrase.unit === null) && hasNumber) {
    return Math.round(phrase.quantity * ingredient.display.grams * phrase.size);
  }
  if (phrase.unit === 'slice') return Math.round(phrase.quantity * 30);
  return hasNumber && phrase.unit === 'piece' ? Math.round(phrase.quantity * 100) : null;
}

/** True when the line starts with an amount (a number or a number word). */
export function lineHasAmount(line: string): boolean {
  return /\d/.test(line) || /^\s*(yksi|kaksi|kolme|nelja|neljä|viisi|puoli|one|two|three|four|five|half|a|an|en|ett|två|tre|fyra|fem|halv)\b/i.test(line);
}
