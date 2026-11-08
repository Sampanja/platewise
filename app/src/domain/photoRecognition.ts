/**
 * Test stand-in for the `recognize-food-photo` Edge Function. The real model
 * picks foods from the closed Fineli list and estimates grams; here a plate
 * is chosen deterministically from the photo's URI, so the same photo always
 * gives the same estimate. Results are always shown with the label "arvio".
 */

export type RecognizedFood = { foodId: string; grams: number };

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

export function recognizePhoto(photoUri: string): RecognizedFood[] {
  return PLATES[hash(photoUri) % PLATES.length].map((food) => ({ ...food }));
}
