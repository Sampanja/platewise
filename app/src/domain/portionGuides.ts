import type { FoodCategory } from '@/data/types';

/**
 * Visual portion comparisons ("kämmenen kokoinen") for correcting an
 * estimated amount without a scale. Grams are typical adult hand-sized
 * portions of that kind of food; they only set the amount, the nutrients
 * still come from the food's per-100 g values.
 */
export type PortionGuide = {
  key: 'palm' | 'fist' | 'cupped' | 'twoHands' | 'thumb' | 'thumbTip' | 'glass' | 'slice';
  grams: number;
};

const GUIDES: Record<FoodCategory, readonly PortionGuide[]> = {
  // Meat, fish, tofu: a palm-sized piece is the classic protein portion.
  meat: [
    { key: 'palm', grams: 120 },
    { key: 'cupped', grams: 60 },
    { key: 'twoHands', grams: 200 },
  ],
  // Rice, pasta, potatoes, porridge: a fist of cooked starch.
  bread: [
    { key: 'fist', grams: 150 },
    { key: 'cupped', grams: 70 },
    { key: 'slice', grams: 35 },
  ],
  produce: [
    { key: 'twoHands', grams: 100 },
    { key: 'fist', grams: 150 },
    { key: 'cupped', grams: 50 },
  ],
  fruit: [
    { key: 'fist', grams: 150 },
    { key: 'cupped', grams: 65 },
  ],
  meal: [
    { key: 'twoHands', grams: 350 },
    { key: 'fist', grams: 200 },
    { key: 'palm', grams: 120 },
  ],
  dairy: [
    { key: 'glass', grams: 200 },
    { key: 'fist', grams: 150 },
    { key: 'thumb', grams: 25 },
  ],
  drink: [{ key: 'glass', grams: 200 }],
  snack: [
    { key: 'cupped', grams: 30 },
    { key: 'thumb', grams: 25 },
  ],
  fat: [
    { key: 'thumbTip', grams: 5 },
    { key: 'thumb', grams: 15 },
  ],
};

export function portionGuides(category: FoodCategory): readonly PortionGuide[] {
  return GUIDES[category];
}

/** Closest guide to an amount (used to describe an estimate: "noin kämmenen kokoinen"). */
export function closestGuide(category: FoodCategory, grams: number): PortionGuide | null {
  const guides = GUIDES[category];
  if (guides.length === 0 || grams <= 0) return null;
  return guides.reduce((best, guide) =>
    Math.abs(guide.grams - grams) < Math.abs(best.grams - grams) ? guide : best,
  );
}

/** Recognition confidence (0–1) as a plain level shown with every estimate. */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function confidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.55) return 'medium';
  return 'low';
}
