import { DEFAULT_PRICE_REGION, PRICE_REGIONS, type PriceRegionCode } from '@/domain/priceRegion';
import { METRIC_UNITS, type UnitPrefs } from '@/domain/units';

import { FALLBACK_LANGUAGE, type Language } from './languages';

/**
 * Active language, price region and units, read at call time like the
 * theme's `colors`. The root layout sets them before rendering and remounts
 * the screens when they change, so strings and formatting helpers need no
 * React context.
 */
let language: Language = FALLBACK_LANGUAGE;
let priceRegion: PriceRegionCode = DEFAULT_PRICE_REGION;
let units: UnitPrefs = METRIC_UNITS;
const listeners = new Set<() => void>();

export function activeLanguage(): Language {
  return language;
}

export function setActiveLanguage(next: Language): void {
  if (next === language) return;
  language = next;
  listeners.forEach((listener) => listener());
}

/** Called after the language changes (e.g. caches of translated text, scheduled notifications). */
export function onLanguageChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function activePriceRegion(): PriceRegionCode {
  return priceRegion;
}

export function setActivePriceRegion(code: PriceRegionCode): void {
  priceRegion = code;
}

/** First day of the week, Monday-first index (0 = Monday, 6 = Sunday). */
let firstWeekday = 0;

export function activeFirstWeekday(): number {
  return firstWeekday;
}

/**
 * The phone's first weekday as expo-localization reports it (1 = Sunday …
 * 7 = Saturday); without one, Sunday in the US and Monday elsewhere.
 */
export function setFirstWeekday(phoneValue: number | null, region: PriceRegionCode): void {
  firstWeekday = phoneValue && phoneValue >= 1 && phoneValue <= 7 ? (phoneValue + 5) % 7 : region === 'US' ? 6 : 0;
}

/** The user's display units (domain/units.ts); everything is stored metric. */
export function activeUnits(): UnitPrefs {
  return units;
}

export function setActiveUnits(next: UnitPrefs): void {
  units = next;
}

/**
 * BCP 47 tag for Intl. Hermes on Android only knows the complete locales it
 * ships (e.g. "fi-FI"); an invented pair such as "fi-SE" silently falls back
 * to en-US formatting, so the tag is always one of the language's real
 * locales. English follows the region between US and British conventions
 * (dates, first day of the week); the currency comes from the price region.
 */
export function intlLocale(lang: Language = language, region: PriceRegionCode = priceRegion): string {
  switch (lang) {
    case 'fi':
      return 'fi-FI';
    case 'sv':
      return 'sv-SE';
    case 'en':
      return region === 'US' ? 'en-US' : 'en-GB';
  }
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
