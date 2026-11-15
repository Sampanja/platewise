import { DEFAULT_PRICE_REGION, PRICE_REGIONS, type PriceRegionCode } from '@/domain/priceRegion';

/**
 * Active formatting settings, read at call time like the theme's `colors`.
 * The root layout sets them before rendering and remounts the screens when
 * they change, so formatting helpers need no React context.
 */
let priceRegion: PriceRegionCode = DEFAULT_PRICE_REGION;

export function activePriceRegion(): PriceRegionCode {
  return priceRegion;
}

export function setActivePriceRegion(code: PriceRegionCode): void {
  priceRegion = code;
}

/**
 * BCP 47 tag for Intl. Hermes on Android only knows the complete locales it
 * ships (e.g. "fi-FI"); an invented pair such as "fi-SE" silently falls back
 * to en-US formatting, so the tag is always one of the language's real locales.
 */
export function intlLocale(): string {
  return 'fi-FI';
}

/**
 * Short symbols for the supported currencies. Hermes ignores
 * `currencyDisplay: 'narrowSymbol'` for some currencies and prints the ISO
 * code ("SEK"); formatted amounts swap the code for this symbol.
 */
export const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = {
  EUR: '€',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  GBP: '£',
  USD: '$',
};

export function currencyOf(code: PriceRegionCode = priceRegion): string {
  return PRICE_REGIONS[code].currency;
}
