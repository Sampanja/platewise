import type { Macros } from '@/data/types';

/**
 * Nutrition label scanning ("ravintoarvotaulukko"). Screens depend only on
 * this interface. The real implementation will send the photo to an Edge
 * Function that reads the per-100 g column with a vision model; the user
 * always checks the numbers before saving, and the food is marked as read
 * from a label. Now: test data.
 */
export type LabelReading = {
  /** Per 100 g (or 100 ml). */
  per100g: Macros;
  /** Package or serving size if printed, grams. */
  servingG?: number;
  /** 0–1: how sure the reader is; low values ask the user to check carefully. */
  confidence: number;
};

export interface NutritionLabelService {
  read(photoUri: string): Promise<LabelReading>;
}

const TEST_LABELS: readonly LabelReading[] = [
  {
    per100g: { kcal: 389, proteinG: 12, carbsG: 63, fatG: 7.5, fiberG: 9.5, sugarG: 1.2, saltG: 0.02 },
    servingG: 40,
    confidence: 0.86,
  },
  {
    per100g: { kcal: 66, proteinG: 10, carbsG: 3.9, fatG: 0.9, fiberG: 0, sugarG: 3.9, saltG: 0.1 },
    servingG: 150,
    confidence: 0.91,
  },
  {
    per100g: { kcal: 472, proteinG: 6.5, carbsG: 61, fatG: 22, fiberG: 3.1, sugarG: 28, saltG: 0.6 },
    servingG: 30,
    confidence: 0.72,
  },
];

const TEST_LATENCY_MS = 1400;

function pick(uri: string): LabelReading {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) hash = (hash * 31 + uri.charCodeAt(i)) >>> 0;
  return TEST_LABELS[hash % TEST_LABELS.length];
}

const testDataLabels: NutritionLabelService = {
  read: (photoUri) => new Promise((resolve) => setTimeout(() => resolve(pick(photoUri)), TEST_LATENCY_MS)),
};

/** The active implementation. Swap for the backend one without touching screens. */
export const nutritionLabel: NutritionLabelService = testDataLabels;
