/**
 * Test data for the food recognition service: plausible plates chosen
 * deterministically from the photo URI, so the same photo gives the same result.
 */

import type { RecognizedFood } from './foodRecognition';

const PLATES: readonly (readonly RecognizedFood[])[] = [
  [
    { foodId: 'chicken-breast', grams: 140 },
    { foodId: 'rice-cooked', grams: 160 },
    { foodId: 'mixed-salad', grams: 80 },
  ],
  [
    { foodId: 'salmon-baked', grams: 130 },
    { foodId: 'potato-boiled', grams: 200 },
    { foodId: 'broccoli', grams: 90 },
  ],
  [
    { foodId: 'spaghetti-bolognese', grams: 350 },
    { foodId: 'mixed-salad', grams: 60 },
  ],
  [
    { foodId: 'meatballs', grams: 150 },
    { foodId: 'mashed-potato', grams: 200 },
    { foodId: 'lingonberries', grams: 30 },
  ],
  [
    { foodId: 'oat-porridge-milk', grams: 250 },
    { foodId: 'blueberries', grams: 60 },
  ],
  [
    { foodId: 'rye-bread', grams: 35 },
    { foodId: 'edam', grams: 20 },
    { foodId: 'cucumber', grams: 40 },
  ],
  [
    { foodId: 'greek-yogurt', grams: 150 },
    { foodId: 'granola', grams: 45 },
    { foodId: 'strawberries', grams: 60 },
  ],
  [
    { foodId: 'pizza', grams: 200 },
    { foodId: 'mixed-salad', grams: 60 },
  ],
];

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function testDataPlate(photoUri: string): RecognizedFood[] {
  return PLATES[hash(photoUri) % PLATES.length].map((food) => ({ ...food }));
}
