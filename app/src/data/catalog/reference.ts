import type {
  AisleCode,
  AllergenCode,
  ChainCode,
  CravingCode,
  DietCode,
  IngredientTag,
  StoreChain,
} from '../types';

/** Store chains and their price level against the base price table. */
export const CHAINS: readonly StoreChain[] = [
  { code: 'lidl', name: 'Lidl', priceMultiplier: 0.85 },
  { code: 's_group', name: 'Prisma / S-market', priceMultiplier: 1.0 },
  { code: 'k_group', name: 'K-Citymarket / K-Market', priceMultiplier: 1.08 },
  { code: 'tokmanni', name: 'Tokmanni Ruoka', priceMultiplier: 0.93 },
];

/** Chain codes used before the chains were grouped; saved data is mapped on load. */
const LEGACY_CHAINS: Readonly<Record<string, ChainCode>> = {
  prisma: 's_group',
  s_market: 's_group',
  alepa: 's_group',
  k_citymarket: 'k_group',
  k_market: 'k_group',
};

/** A known chain code for any saved value (falls back to Prisma / S-market). */
export function normalizeChainCode(code: string | null | undefined): ChainCode {
  if (code && CHAINS.some((chain) => chain.code === code)) return code as ChainCode;
  return (code && LEGACY_CHAINS[code]) || 's_group';
}

export const CHAINS_BY_CODE = Object.fromEntries(CHAINS.map((c) => [c.code, c])) as Record<
  ChainCode,
  StoreChain
>;

/** Allergens shown in pickers, most common first. */
export const ALLERGENS: readonly AllergenCode[] = [
  'milk',
  'gluten',
  'egg',
  'nuts',
  'peanut',
  'fish',
  'crustaceans',
  'soy',
  'sesame',
  'celery',
  'mustard',
  'molluscs',
  'sulphites',
  'lupin',
];

export const DIETS: readonly DietCode[] = ['vegetarian', 'vegan', 'pescatarian', 'lactose_free'];

/** Ingredient tags each diet excludes (`diet_excluded_tags`). */
export const DIET_EXCLUDED_TAGS: Record<DietCode, readonly IngredientTag[]> = {
  vegetarian: ['meat', 'pork', 'beef', 'poultry', 'fish', 'seafood'],
  vegan: ['meat', 'pork', 'beef', 'poultry', 'fish', 'seafood', 'egg', 'dairy', 'lactose', 'honey'],
  pescatarian: ['meat', 'pork', 'beef', 'poultry'],
  lactose_free: ['lactose'],
};

export const AISLE_ORDER: readonly AisleCode[] = [
  'produce',
  'bread',
  'meat',
  'fish',
  'dairy',
  'frozen',
  'dry',
  'canned',
  'spices',
];

export const CRAVINGS: readonly CravingCode[] = [
  'chicken',
  'fish',
  'minced',
  'vegetarian',
  'pasta',
  'soup',
  'asian',
  'mexican',
  'quick',
  'oven',
];

/** "Nopea" means at most this many minutes. */
export const QUICK_MAX_MIN = 30;

/** Calorie goal floor (docs/PLAN.md, risks): never suggest or accept less. */
export const MIN_KCAL_GOAL = 1200;

export const DEFAULT_GOALS = { kcal: 2000, proteinG: 100, carbsG: 230, fatG: 70 } as const;
