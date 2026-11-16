import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { searchIngredients } from '@/data/catalog/search';
import type { ImportedIngredient } from '@/data/types';
import { queryVariants } from '@/domain/foodText';
import { extractRecipeFromHtml, ingredientGrams, ingredientPhrases, lineHasAmount, type RecipeDraft } from '@/domain/recipeImport';

/**
 * "Tuo linkistä": fetch a recipe page and read its schema.org/Recipe JSON-LD.
 * Screens depend only on this interface.
 *
 * `local` (now): the page is fetched on the device and only the structured
 * recipe data is read; nothing else is kept (no images, no page text).
 * `live` (backend phase): pages without JSON-LD go to the `import-recipe`
 * Edge Function, where the model extracts the recipe into the same draft
 * shape (docs/GENERATION.md, section 21). Ingredients always end up matched
 * to the closed ingredient table and reviewed by the user.
 */
export type ImportResult =
  | { status: 'found'; draft: RecipeDraft }
  | { status: 'noRecipe' }
  | { status: 'offline' }
  | { status: 'invalidUrl' };

export interface RecipeImportService {
  readonly mode: 'local' | 'live';
  fromUrl(url: string): Promise<ImportResult>;
}

const TIMEOUT_MS = 12_000;
/** Recipe pages are small; anything bigger is not read. */
const MAX_HTML_CHARS = 3_000_000;

/** A pasted link as an http(s) URL, or null. Text around the link (a shared message) is ignored. */
export function normalizeUrl(input: string): string | null {
  const match = /https?:\/\/[^\s<>"']+/i.exec(input.trim()) ?? /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.exec(input.trim());
  if (!match) return null;
  const url = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
  return /^https?:\/\/[^/\s]+\.[^/\s]+/i.test(url) ? url : null;
}

/** The site name shown as the recipe's source ("www.example.com" → "example.com"). */
export function sourceHost(url: string): string {
  const host = /^https?:\/\/([^/?#]+)/i.exec(url)?.[1] ?? url;
  return host.replace(/^www\./i, '');
}

/** Under this a match is shown for the user to confirm. */
export const CONFIRM_BELOW = 0.8;
const MIN_MATCH = 0.5;
/** Basic staples without an amount ("suolaa") get a pinch. */
const STAPLE_PINCH_G = 5;

function bestIngredient(query: string): { id: string; score: number } | null {
  let best: { id: string; score: number } | null = null;
  for (const variant of queryVariants(query)) {
    const top = searchIngredients(variant, 1)[0];
    if (top && (!best || top.score > best.score)) best = { id: top.item.id, score: top.score };
  }
  return best;
}

/**
 * Ingredient lines matched to the ingredient table with amounts in grams for
 * the whole recipe. Uncertain or unmatched lines are kept for the review.
 */
export function matchIngredientLines(lines: readonly string[]): ImportedIngredient[] {
  const out: ImportedIngredient[] = [];
  for (const line of lines) {
    const phrases = ingredientPhrases(line);
    if (phrases.length === 0) {
      out.push({ line, ingredientId: null, grams: null, confidence: 0 });
      continue;
    }
    const hasAmount = lineHasAmount(line);
    for (const phrase of phrases) {
      const best = bestIngredient(phrase.query);
      const ingredient = best && best.score >= MIN_MATCH ? INGREDIENTS_BY_ID[best.id] : undefined;
      if (!best || !ingredient) {
        out.push({ line, ingredientId: null, grams: null, confidence: 0 });
        continue;
      }
      const grams = ingredientGrams(phrase, ingredient, hasAmount) ?? (ingredient.pantry === 'default' ? STAPLE_PINCH_G : null);
      out.push({ line, ingredientId: ingredient.id, grams, confidence: Math.round(best.score * 100) / 100 });
    }
  }
  return out;
}

const localImport: RecipeImportService = {
  mode: 'local',
  async fromUrl(input) {
    const url = normalizeUrl(input);
    if (!url) return { status: 'invalidUrl' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, { headers: { Accept: 'text/html,application/xhtml+xml' }, signal: controller.signal });
      if (!response.ok) return { status: response.status === 404 ? 'noRecipe' : 'offline' };
      const html = (await response.text()).slice(0, MAX_HTML_CHARS);
      const draft = extractRecipeFromHtml(html);
      return draft ? { status: 'found', draft } : { status: 'noRecipe' };
    } catch {
      return { status: 'offline' };
    } finally {
      clearTimeout(timer);
    }
  },
};

/** The active implementation: JSON-LD on the device until the backend phase adds the model. */
export const recipeImport: RecipeImportService = localImport;
