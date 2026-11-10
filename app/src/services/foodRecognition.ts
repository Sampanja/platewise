import { z } from 'zod';

import { testDataPlate } from './foodRecognitionTestData';

/**
 * One recognised food: an id from the closed food list and estimated grams.
 * Macros are never part of the result: they are computed from the food
 * table (Fineli) for the grams, after the user has checked them.
 */
export type RecognizedFood = {
  foodId: string;
  grams: number;
  /**
   * 0–1, only from the real model. Items under NEEDS_CHECK_BELOW are marked
   * "Tarkista". There is no "sure" label: every result is an estimate.
   */
  confidence?: number;
};

/** `test`: built-in example plates (no model). `live`: the backend model. */
export type RecognitionMode = 'test' | 'live';

/**
 * Food photo recognition. Screens depend only on this interface:
 * photo → `recognize-food-photo` Edge Function → foods chosen from the
 * closed food list with estimated grams → macros from the food table in the
 * app. Results are always labelled "arvio" and editable before saving.
 */
export interface FoodRecognitionService {
  readonly mode: RecognitionMode;
  recognize(photoUri: string): Promise<RecognizedFood[]>;
}

/** Below this the result row asks the user to check the item. */
export const NEEDS_CHECK_BELOW = 0.55;

export function needsCheck(food: RecognizedFood): boolean {
  return food.confidence !== undefined && food.confidence < NEEDS_CHECK_BELOW;
}

/** Response of the `recognize-food-photo` Edge Function (docs/GENERATION.md). */
const ResponseSchema = z.object({
  foods: z
    .array(
      z.object({
        foodId: z.string().min(1),
        grams: z.number().finite(),
        confidence: z.number().min(0).max(1).optional(),
      }),
    )
    .max(12),
});

/** Grams outside this are clamped: a plate never holds less than a gram or more than two kilos of one food. */
const GRAMS_MIN = 1;
const GRAMS_MAX = 2000;

/**
 * Validates the backend response before use. Unknown food ids are dropped
 * (closed list, CLAUDE.md principle 2); anything malformed throws, and the
 * screen shows its error state instead of guessing.
 */
export function parseRecognitionResponse(json: unknown, isKnownFood: (id: string) => boolean): RecognizedFood[] {
  const parsed = ResponseSchema.parse(json);
  return parsed.foods
    .filter((food) => isKnownFood(food.foodId))
    .map((food) => ({
      foodId: food.foodId,
      grams: Math.round(Math.min(GRAMS_MAX, Math.max(GRAMS_MIN, food.grams))),
      confidence: food.confidence,
    }));
}

export type BackendRecognitionConfig = {
  /** Supabase project URL (public). */
  url: string;
  /** Supabase anon key (public; the only key in the app, CLAUDE.md principle 5). */
  anonKey: string;
  /** The signed-in user's access token. */
  getAccessToken: () => Promise<string | null>;
  isKnownFood: (id: string) => boolean;
};

/**
 * The real implementation, ready for the backend phase: uploads the photo as
 * multipart form data to the Edge Function (which holds the model key) and
 * validates the answer. Not active yet; see `foodRecognition` below.
 */
export function createBackendRecognition(config: BackendRecognitionConfig): FoodRecognitionService {
  return {
    mode: 'live',
    async recognize(photoUri) {
      const token = await config.getAccessToken();
      if (!token) throw new Error('Not signed in');
      const form = new FormData();
      // React Native's FormData takes a { uri, name, type } file object.
      form.append('photo', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
      const response = await fetch(`${config.url}/functions/v1/recognize-food-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, apikey: config.anonKey },
        body: form,
      });
      if (!response.ok) throw new Error(`recognize-food-photo ${response.status}`);
      return parseRecognitionResponse(await response.json(), config.isKnownFood);
    },
  };
}

/** Simulated network and model time for the test data. */
const TEST_LATENCY_MS = 1600;

const testDataRecognition: FoodRecognitionService = {
  mode: 'test',
  recognize: (photoUri) =>
    new Promise((resolve) => setTimeout(() => resolve(testDataPlate(photoUri)), TEST_LATENCY_MS)),
};

/**
 * The active implementation. Test mode until the backend phase: screens show
 * "Testitila – oikea tunnistus tulossa" whenever `mode` is 'test'. Switch to
 * `createBackendRecognition(...)` without touching the screens.
 */
export const foodRecognition: FoodRecognitionService = testDataRecognition;
