import { z } from 'zod';

import type { Food, FoodCategory, FoodPortion, Macros } from '@/data/types';

/**
 * Open Food Facts product → a diary food. The API is open data (ODbL) and
 * crowd-sourced, so every value is validated and the food is marked as a
 * barcode product in the UI. Pure functions; the HTTP call is in
 * services/barcode.ts.
 */

/** Numbers in OFF nutriments are sometimes strings ("12.5"). */
const num = z.preprocess((v) => (typeof v === 'string' ? Number(v.replace(',', '.')) : v), z.number().finite());
const optionalNum = num.optional().catch(undefined);

const nutrimentsSchema = z
  .object({
    'energy-kcal_100g': optionalNum,
    energy_100g: optionalNum,
    proteins_100g: optionalNum,
    carbohydrates_100g: optionalNum,
    fat_100g: optionalNum,
    fiber_100g: optionalNum,
    sugars_100g: optionalNum,
    salt_100g: optionalNum,
  })
  .passthrough();

const productSchema = z
  .object({
    product_name_fi: z.string().optional().catch(undefined),
    product_name: z.string().optional().catch(undefined),
    generic_name: z.string().optional().catch(undefined),
    brands: z.string().optional().catch(undefined),
    image_front_small_url: z.string().url().optional().catch(undefined),
    image_front_url: z.string().url().optional().catch(undefined),
    serving_quantity: optionalNum,
    product_quantity: optionalNum,
    categories_tags: z.array(z.string()).optional().catch(undefined),
    nutriments: nutrimentsSchema.optional().catch(undefined),
  })
  .passthrough();

export const offResponseSchema = z
  .object({
    status: z.union([z.number(), z.string()]).optional(),
    product: productSchema.optional(),
  })
  .passthrough();

export type OffResponse = z.infer<typeof offResponseSchema>;

const KJ_PER_KCAL = 4.184;
/** Sanity limit: nothing has more than 900 kcal per 100 g (pure fat). */
const MAX_KCAL_100G = 950;

const CATEGORY_RULES: [RegExp, FoodCategory][] = [
  [/beverages|drinks|juices|waters|sodas|coffees|teas/, 'drink'],
  [/dairies|milks|yogurts|cheeses|creams|eggs/, 'dairy'],
  [/meats|fishes|seafood|poultry|sausages|hams|tofu|legumes/, 'meat'],
  [/breads|cereals|pastas|rices|flakes|crispbreads|porridges|flours/, 'bread'],
  [/fruits|berries|dried-fruits/, 'fruit'],
  [/vegetables|salads|potatoes/, 'produce'],
  [/fats|oils|butters|margarines|spreads|sauces|condiments|jams|honeys/, 'fat'],
  [/snacks|sweets|chocolates|candies|biscuits|cakes|chips|bars|nuts/, 'snack'],
  [/meals|dishes|pizzas|soups|sandwiches/, 'meal'],
];

export function guessCategory(tags: readonly string[] | undefined): FoodCategory {
  const joined = (tags ?? []).join(' ');
  for (const [pattern, category] of CATEGORY_RULES) if (pattern.test(joined)) return category;
  return 'meal';
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export type ParsedProduct =
  | { status: 'found'; food: Food }
  | { status: 'notFound' }
  /** Found, but without enough nutrition data to log it (the user can complete it). */
  | { status: 'incomplete'; name: string; brand?: string; imageUrl?: string };

export function foodIdForBarcode(barcode: string): string {
  return `off:${barcode}`;
}

/** Validates an OFF API response and turns it into a food with per-100 g nutrients. */
export function parseOffProduct(json: unknown, barcode: string): ParsedProduct {
  const parsed = offResponseSchema.safeParse(json);
  if (!parsed.success || !parsed.data.product || Number(parsed.data.status) !== 1) return { status: 'notFound' };
  const p = parsed.data.product;
  const name = (p.product_name_fi || p.product_name || p.generic_name || '').trim();
  const brand = p.brands?.split(',')[0]?.trim() || undefined;
  const imageUrl = p.image_front_small_url ?? p.image_front_url;
  const n = p.nutriments;

  const kcal = n?.['energy-kcal_100g'] ?? (n?.energy_100g !== undefined ? n.energy_100g / KJ_PER_KCAL : undefined);
  const macrosKnown =
    kcal !== undefined && n?.proteins_100g !== undefined && n?.carbohydrates_100g !== undefined && n?.fat_100g !== undefined;
  if (!name || !macrosKnown || kcal < 0 || kcal > MAX_KCAL_100G) {
    return name ? { status: 'incomplete', name, brand, imageUrl } : { status: 'notFound' };
  }

  const per100g: Macros = {
    kcal: Math.round(kcal),
    proteinG: round1(n.proteins_100g ?? 0),
    carbsG: round1(n.carbohydrates_100g ?? 0),
    fatG: round1(n.fat_100g ?? 0),
  };
  if (n.fiber_100g !== undefined) per100g.fiberG = round1(n.fiber_100g);
  if (n.sugars_100g !== undefined) per100g.sugarG = round1(n.sugars_100g);
  if (n.salt_100g !== undefined) per100g.saltG = round1(n.salt_100g);

  const portions: FoodPortion[] = [];
  if (p.serving_quantity && p.serving_quantity > 0 && p.serving_quantity <= 2000) {
    portions.push({ label: '1 annos', grams: Math.round(p.serving_quantity) });
  }
  if (p.product_quantity && p.product_quantity > 0 && p.product_quantity <= 1500 && p.product_quantity !== p.serving_quantity) {
    portions.push({ label: '1 pakkaus', grams: Math.round(p.product_quantity) });
  }

  return {
    status: 'found',
    food: {
      id: foodIdForBarcode(barcode),
      name,
      category: guessCategory(p.categories_tags),
      per100g,
      portions,
      source: 'barcode',
      brand,
      barcode,
      imageUrl,
    },
  };
}

/** EAN-8, UPC-A, EAN-13 and GTIN-14 with a valid check digit. */
export function isValidBarcode(code: string): boolean {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const check = digits.pop() as number;
  const sum = digits
    .reverse()
    .reduce((acc, digit, i) => acc + digit * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}
