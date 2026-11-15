/**
 * Price regions: the country whose price level and currency the price
 * estimates use. There are no stores: a price is the ingredient's average
 * price in the region.
 *
 * Finland is real data: the ingredient table's prices are Finnish average
 * prices in euros. Every other region is a rough estimate: the Finnish price
 * × the country's food price level relative to Finland × the exchange rate.
 * The UI always says so (`isRoughEstimate`).
 *
 * Amounts in a region are integers in the currency's minor unit (cents, öre).
 * The `…Cents` field names across the app mean exactly that.
 *
 * Price levels: Eurostat comparative price levels for food and non-alcoholic
 * beverages (EU = 100), rounded and divided by Finland's; the UK and the US are
 * comparable estimates. Exchange rates are rounded. Reviewed 2026-11; they
 * change rarely and only shift a rough estimate.
 */

export const PRICE_REGION_CODES = ['FI', 'SE', 'NO', 'DK', 'EE', 'DE', 'NL', 'FR', 'IE', 'GB', 'US'] as const;
export type PriceRegionCode = (typeof PRICE_REGION_CODES)[number];

export type PriceRegion = {
  code: PriceRegionCode;
  /** ISO 4217 code for Intl.NumberFormat. */
  currency: string;
  /** Food price level relative to Finland (Finland = 1). */
  priceLevel: number;
  /** Units of the currency per euro. */
  perEuro: number;
  /** Budget inputs move in this many minor units (1 € / 10 kr). */
  budgetStep: number;
  /** Real price data (Finland) or a rough estimate from the Finnish prices. */
  dataSource: 'measured' | 'estimated';
};

export const PRICE_REGIONS: Readonly<Record<PriceRegionCode, PriceRegion>> = {
  FI: { code: 'FI', currency: 'EUR', priceLevel: 1, perEuro: 1, budgetStep: 100, dataSource: 'measured' },
  SE: { code: 'SE', currency: 'SEK', priceLevel: 0.95, perEuro: 11.2, budgetStep: 1000, dataSource: 'estimated' },
  NO: { code: 'NO', currency: 'NOK', priceLevel: 1.3, perEuro: 11.6, budgetStep: 1000, dataSource: 'estimated' },
  DK: { code: 'DK', currency: 'DKK', priceLevel: 1.1, perEuro: 7.46, budgetStep: 1000, dataSource: 'estimated' },
  EE: { code: 'EE', currency: 'EUR', priceLevel: 0.92, perEuro: 1, budgetStep: 100, dataSource: 'estimated' },
  DE: { code: 'DE', currency: 'EUR', priceLevel: 0.88, perEuro: 1, budgetStep: 100, dataSource: 'estimated' },
  NL: { code: 'NL', currency: 'EUR', priceLevel: 0.88, perEuro: 1, budgetStep: 100, dataSource: 'estimated' },
  FR: { code: 'FR', currency: 'EUR', priceLevel: 0.95, perEuro: 1, budgetStep: 100, dataSource: 'estimated' },
  IE: { code: 'IE', currency: 'EUR', priceLevel: 1, perEuro: 1, budgetStep: 100, dataSource: 'estimated' },
  GB: { code: 'GB', currency: 'GBP', priceLevel: 0.92, perEuro: 0.85, budgetStep: 100, dataSource: 'estimated' },
  US: { code: 'US', currency: 'USD', priceLevel: 1.05, perEuro: 1.08, budgetStep: 100, dataSource: 'estimated' },
};

/** Used when the phone's region is not supported. Finnish data is the only real data. */
export const DEFAULT_PRICE_REGION: PriceRegionCode = 'FI';

export function isPriceRegionCode(value: unknown): value is PriceRegionCode {
  return typeof value === 'string' && (PRICE_REGION_CODES as readonly string[]).includes(value);
}

/** The supported region for a phone region code (e.g. "SE"), or the default. */
export function priceRegionFor(regionCode: string | null | undefined): PriceRegionCode {
  const upper = regionCode?.toUpperCase();
  return isPriceRegionCode(upper) ? upper : DEFAULT_PRICE_REGION;
}

/**
 * Converts the ingredient table's Finnish euro prices to the region: multiply
 * a cost in euro cents by this to get minor units of the region's currency.
 */
export function priceFactor(code: PriceRegionCode): number {
  const region = PRICE_REGIONS[code];
  return region.priceLevel * region.perEuro;
}

export function isRoughEstimate(code: PriceRegionCode): boolean {
  return PRICE_REGIONS[code].dataSource === 'estimated';
}

/** Rounds an amount to the region's budget step (at least one step). */
export function roundToBudgetStep(amount: number, code: PriceRegionCode): number {
  const step = PRICE_REGIONS[code].budgetStep;
  return Math.max(step, Math.round(amount / step) * step);
}

/** Rounds up to whole currency units (whole euros, whole kronor). */
export function ceilToWholeUnit(amount: number): number {
  return Math.ceil(amount / 100) * 100;
}

/** Budget limits for inputs: 10–300 € and the same purchasing power elsewhere. */
export function budgetBounds(code: PriceRegionCode): { min: number; max: number; step: number } {
  const factor = priceFactor(code);
  return {
    min: roundToBudgetStep(1000 * factor, code),
    max: roundToBudgetStep(30000 * factor, code),
    step: PRICE_REGIONS[code].budgetStep,
  };
}

/** The default weekly budget (75 € in Finland) in the region. */
export function defaultWeeklyBudget(code: PriceRegionCode): number {
  return roundToBudgetStep(7500 * priceFactor(code), code);
}

/** Moves a budget from one region to another with the same purchasing power. */
export function convertBudget(amount: number, from: PriceRegionCode, to: PriceRegionCode): number {
  if (from === to) return amount;
  const { min, max } = budgetBounds(to);
  const converted = roundToBudgetStep((amount / priceFactor(from)) * priceFactor(to), to);
  return Math.min(max, Math.max(min, converted));
}
