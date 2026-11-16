import { z } from 'zod';

import { INGREDIENTS_BY_ID } from '@/data/catalog';
import type { PantryLevel } from '@/data/types';

import type { RecognitionMode } from './foodRecognition';

/**
 * One ingredient seen on a fridge or cupboard shelf: an id from the closed
 * ingredient table and a rough amount. Never a free-text name: unknown items
 * are dropped (CLAUDE.md principle 1). Always shown as "arvio" and reviewed
 * by the user before anything is saved.
 */
export type RecognizedPantryItem = {
  ingredientId: string;
  level: PantryLevel;
  /** 0–1. Under NEEDS_CHECK_BELOW the review row asks the user to check it. */
  confidence: number;
};

export interface PantryRecognitionService {
  readonly mode: RecognitionMode;
  /** One or more photos (e.g. fridge + cupboard) → one merged list. */
  recognize(photoUris: readonly string[]): Promise<RecognizedPantryItem[]>;
}

export const PANTRY_NEEDS_CHECK_BELOW = 0.6;

/** Response of the `recognize-pantry-photos` Edge Function (docs/GENERATION.md, section 19). */
const ResponseSchema = z.object({
  items: z
    .array(
      z.object({
        ingredientId: z.string().min(1),
        level: z.enum(['low', 'half', 'plenty']),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(60),
});

/** Validates the backend answer: unknown ids dropped, one row per ingredient (highest confidence wins). */
export function parsePantryResponse(json: unknown, isKnownIngredient: (id: string) => boolean): RecognizedPantryItem[] {
  const parsed = ResponseSchema.parse(json);
  const byId = new Map<string, RecognizedPantryItem>();
  for (const item of parsed.items) {
    if (!isKnownIngredient(item.ingredientId)) continue;
    const old = byId.get(item.ingredientId);
    if (!old || old.confidence < item.confidence) byId.set(item.ingredientId, item);
  }
  return [...byId.values()];
}

export type BackendPantryConfig = {
  url: string;
  anonKey: string;
  getAccessToken: () => Promise<string | null>;
  isKnownIngredient: (id: string) => boolean;
};

/** The real implementation for the backend phase (not active yet). */
export function createBackendPantryRecognition(config: BackendPantryConfig): PantryRecognitionService {
  return {
    mode: 'live',
    async recognize(photoUris) {
      const token = await config.getAccessToken();
      if (!token) throw new Error('Not signed in');
      const form = new FormData();
      photoUris.forEach((uri, index) =>
        form.append('photos', { uri, name: `shelf-${index}.jpg`, type: 'image/jpeg' } as unknown as Blob),
      );
      const response = await fetch(`${config.url}/functions/v1/recognize-pantry-photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, apikey: config.anonKey },
        body: form,
      });
      if (!response.ok) throw new Error(`recognize-pantry-photos ${response.status}`);
      return parsePantryResponse(await response.json(), config.isKnownIngredient);
    },
  };
}

/** Example shelves for test mode: a fridge and a cupboard. Ids from the ingredient table. */
const TEST_SHELVES: readonly (readonly RecognizedPantryItem[])[] = [
  [
    { ingredientId: 'milk', level: 'half', confidence: 0.92 },
    { ingredientId: 'eggs', level: 'plenty', confidence: 0.88 },
    { ingredientId: 'cream', level: 'plenty', confidence: 0.74 },
    { ingredientId: 'carrot', level: 'half', confidence: 0.81 },
    { ingredientId: 'bell-pepper', level: 'low', confidence: 0.52 },
    { ingredientId: 'cucumber', level: 'half', confidence: 0.77 },
    { ingredientId: 'cheese', level: 'half', confidence: 0.69 },
    { ingredientId: 'minced-beef', level: 'plenty', confidence: 0.58 },
  ],
  [
    { ingredientId: 'spaghetti', level: 'plenty', confidence: 0.9 },
    { ingredientId: 'rice', level: 'half', confidence: 0.86 },
    { ingredientId: 'crushed-tomatoes', level: 'plenty', confidence: 0.83 },
    { ingredientId: 'onion', level: 'half', confidence: 0.79 },
    { ingredientId: 'oats', level: 'low', confidence: 0.55 },
    { ingredientId: 'potato', level: 'plenty', confidence: 0.72 },
  ],
];

const TEST_LATENCY_MS = 1800;

/**
 * Test mode: the first photo shows the fridge, the second the cupboard, then
 * they repeat. Only ids that exist in the table are returned.
 */
export function testPantryShelves(photoCount: number, isKnownIngredient: (id: string) => boolean): RecognizedPantryItem[] {
  const json = { items: Array.from({ length: Math.max(1, photoCount) }, (_, i) => TEST_SHELVES[i % TEST_SHELVES.length]).flat() };
  return parsePantryResponse(json, isKnownIngredient);
}

const knownIngredient = (id: string) => INGREDIENTS_BY_ID[id] !== undefined;

const testDataPantryRecognition: PantryRecognitionService = {
  mode: 'test',
  recognize: (photoUris) =>
    new Promise((resolve) => setTimeout(() => resolve(testPantryShelves(photoUris.length, knownIngredient)), TEST_LATENCY_MS)),
};

/** The active implementation: test mode until the backend phase (screens say so). */
export const pantryRecognition: PantryRecognitionService = testDataPantryRecognition;
