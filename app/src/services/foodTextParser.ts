import { z } from 'zod';

import { FOODS_BY_ID } from '@/data/catalog';
import { searchCatalogFoods } from '@/data/catalog/search';
import { foodText } from '@/data/catalog/text';
import { phraseGrams, queryVariants, splitFoodText, type PortionInfo } from '@/domain/foodText';
import { LANGUAGES } from '@/i18n/languages';

/**
 * Free text or speech → diary foods ("kaksi ruisleipää juustolla ja kahvi
 * maidolla"). Screens depend only on this interface. The result goes to the
 * same review screen as photo recognition, marked "arvio", and nothing is
 * saved before the user confirms.
 *
 * `local`: rule-based parsing on the device (domain/foodText.ts) and fuzzy
 * matching to the closed food list in every language.
 * `live` (backend phase): the `parse-food-text` Edge Function lets the model
 * pick foods from the same list and estimate grams; ids are validated here.
 */
export type ParsedFood = {
  foodId: string;
  grams: number;
  /** 0–1: how sure the match is; low ones say "Tarkista". */
  confidence: number;
  /** The words this food came from. */
  text: string;
};

export type ParsedFoodText = { foods: ParsedFood[]; unmatched: string[] };

export interface FoodTextParserService {
  readonly mode: 'local' | 'live';
  parse(text: string): Promise<ParsedFoodText>;
}

/** Matches under this are reported as not understood rather than guessed. */
export const MIN_FOOD_MATCH = 0.55;

function portionsOf(foodId: string): PortionInfo[] {
  const food = FOODS_BY_ID[foodId];
  if (!food) return [];
  return food.portions.map((portion, index) => ({
    grams: portion.grams,
    labels: LANGUAGES.map((language) => foodText(foodId, language).portions[index] ?? ''),
  }));
}

/** Score of the best food for a query, trying its base forms. */
function bestFood(query: string, baseFormsOnly = false): { foodId: string; score: number } | null {
  let best: { foodId: string; score: number } | null = null;
  const variants = queryVariants(query);
  for (const variant of baseFormsOnly && variants.length > 1 ? variants.slice(1) : variants) {
    const top = searchCatalogFoods(variant, 1)[0];
    if (top && (!best || top.score > best.score)) best = { foodId: top.item.id, score: top.score };
  }
  return best;
}

/** A Finnish adessive word on its own ("maidolla"): the food it names is "maito", not a dish named "… maidolla". */
function isAdessiveQuery(query: string): boolean {
  return !query.includes(' ') && /(lla|lle)$/.test(query);
}

/** Matches a phrase; when the whole phrase fails, its strongest single word may still name a food. */
function matchPhrase(query: string): { foodId: string; score: number } | null {
  const best = bestFood(query, isAdessiveQuery(query));
  if (best && best.score >= MIN_FOOD_MATCH) return best;
  const words = query.split(' ').filter((word) => word.length >= 4);
  if (words.length === 0 || (words.length === 1 && words[0] === query)) return best;
  let fallback: { foodId: string; score: number } | null = null;
  for (const word of words) {
    const match = bestFood(word);
    // A partial match is less certain: it asks to be checked.
    if (match && match.score >= 0.8 && (!fallback || match.score > fallback.score)) fallback = { ...match, score: match.score * 0.75 };
  }
  return fallback ?? best;
}

/** The on-device parser. Synchronous and deterministic (tested in foodText.test.ts). */
export function parseFoodTextLocally(text: string): ParsedFoodText {
  const foods: ParsedFood[] = [];
  const unmatched: string[] = [];
  const phrases = splitFoodText(text);
  for (let index = 0; index < phrases.length; index++) {
    let phrase = phrases[index];
    // "kahvi maidolla" as one food when the list has it.
    if (phrase.whole) {
      const whole = bestFood(phrase.whole.phrase.query);
      if (whole && whole.score >= 0.95) {
        index += phrase.whole.replaces - 1;
        phrase = phrase.whole.phrase;
      }
    }
    const best = matchPhrase(phrase.query);
    if (!best || best.score < MIN_FOOD_MATCH) {
      unmatched.push(phrase.text);
      continue;
    }
    foods.push({
      foodId: best.foodId,
      grams: phraseGrams(phrase, portionsOf(best.foodId)),
      confidence: Math.round(best.score * 100) / 100,
      text: phrase.text,
    });
  }
  return { foods, unmatched };
}

/** Response of `parse-food-text` (docs/GENERATION.md, section 20). */
const ResponseSchema = z.object({
  foods: z.array(z.object({ foodId: z.string(), grams: z.number().min(1).max(3000), confidence: z.number().min(0).max(1), text: z.string() })).max(20),
  unmatched: z.array(z.string()).max(20),
});

/** Validates the backend answer: unknown food ids become "not understood". */
export function parseFoodTextResponse(json: unknown): ParsedFoodText {
  const parsed = ResponseSchema.parse(json);
  const known = parsed.foods.filter((food) => FOODS_BY_ID[food.foodId]);
  const unknown = parsed.foods.filter((food) => !FOODS_BY_ID[food.foodId]).map((food) => food.text);
  return { foods: known.map((f) => ({ ...f, grams: Math.round(f.grams) })), unmatched: [...parsed.unmatched, ...unknown] };
}

const localParser: FoodTextParserService = {
  mode: 'local',
  parse: async (text) => parseFoodTextLocally(text),
};

/** The active implementation: local until the backend phase adds the model. */
export const foodTextParser: FoodTextParserService = localParser;
