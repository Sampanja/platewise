import type { PriceRegionCode } from '@/domain/priceRegion';

import { activeTable } from './registry';
import { activePriceRegion, CURRENCY_SYMBOLS, currencyOf, intlLocale } from './locale';
import type { Strings } from './types';

export { activeLanguage, intlLocale, onLanguageChange } from './locale';
export { LANGUAGE_NAMES, LANGUAGES, languageFor, type Language } from './languages';
export type { Strings } from './types';

type Node = Record<string, unknown>;

function isPlainObject(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolve(path: readonly string[]): Node {
  let node: unknown = activeTable();
  for (const key of path) node = (node as Node)[key];
  return node as Node;
}

const liveNodes = new Map<string, Node>();

/**
 * A view of one object in the string table that always reads the active
 * language. Screens keep `const t = strings.recipes` at module level; the
 * view resolves `t.title` at render time, so a language change only needs
 * the root layout's remount. Strings and arrays are returned as they are.
 */
function liveNode(path: readonly string[]): Node {
  const cacheKey = path.join('.');
  const cached = liveNodes.get(cacheKey);
  if (cached) return cached;
  const node = new Proxy({} as Node, {
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      const value = resolve(path)[key];
      return isPlainObject(value) ? liveNode([...path, key]) : value;
    },
    has: (_target, key) => key in resolve(path),
    ownKeys: () => Reflect.ownKeys(resolve(path)),
    getOwnPropertyDescriptor(_target, key) {
      const descriptor = Reflect.getOwnPropertyDescriptor(resolve(path), key);
      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
    set: () => false,
  });
  liveNodes.set(cacheKey, node);
  return node;
}

/** UI strings in the active language (i18n/fi.ts is the reference, other languages have the same keys). */
export const strings = liveNode([]) as unknown as Strings;

/** Replaces `{key}` placeholders in a localised string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const numberFormatters = new Map<string, Intl.NumberFormat>();

/** Cached Intl.NumberFormat for the active locale; options are part of the key. */
export function numberFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = intlLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

function moneyFormatter(region: PriceRegionCode, whole: boolean): Intl.NumberFormat {
  return numberFormatter({
    style: 'currency',
    currency: currencyOf(region),
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
}

/** Long forms Hermes prints for some locale and currency pairs ("US$" in Swedish). */
const LONG_SYMBOLS: Readonly<Record<string, readonly string[]>> = { USD: ['US$'], GBP: ['GB£'] };

/**
 * Swaps an ISO code or long symbol that Hermes or English prints in place of
 * the short symbol ("50,10 SEK" → "50,10 kr", "3,40 US$" → "3,40 $"). Kronor
 * are written after the amount in every language ("800.00 kr", not "kr 800.00").
 */
function withSymbol(formatted: string, region: PriceRegionCode): string {
  const code = currencyOf(region);
  const symbol = CURRENCY_SYMBOLS[code];
  if (!symbol) return formatted;
  const variant = [code, ...(LONG_SYMBOLS[code] ?? [])].find((form) => formatted.includes(form));
  const swapped = variant ? formatted.replace(variant, symbol) : formatted;
  if (symbol === 'kr' && swapped.trimStart().startsWith('kr')) return `${swapped.trimStart().slice(2).trim()} kr`;
  return swapped;
}

/**
 * Formats an amount in minor units (cents, öre) in the price region's
 * currency, e.g. 420 → "4,20 €", "4,20 kr" or "£4.20". Defaults to the active
 * region; a saved plan passes its own.
 */
export function formatMoney(minor: number, region: PriceRegionCode = activePriceRegion()): string {
  return withSymbol(moneyFormatter(region, false).format(minor / 100), region);
}

/** Whole currency units without decimals, e.g. 6600 → "66 €". For budgets and round-up suggestions. */
export function formatWholeMoney(minor: number, region: PriceRegionCode = activePriceRegion()): string {
  return withSymbol(moneyFormatter(region, true).format(Math.round(minor / 100)), region);
}

/** The currency symbol alone, e.g. "€" or "kr", for input fields. */
export function currencySymbol(region: PriceRegionCode = activePriceRegion()): string {
  return CURRENCY_SYMBOLS[currencyOf(region)] ?? currencyOf(region);
}

/** Whether the currency symbol goes before the amount in the active locale ("£5" vs "5 €"). */
export function currencySymbolFirst(region: PriceRegionCode = activePriceRegion()): boolean {
  const sample = formatWholeMoney(500, region);
  return sample.trimStart().startsWith(currencySymbol(region));
}

/** Rounds and groups thousands in the active locale, e.g. 1240.4 → "1 240" or "1,240". */
export function formatInteger(value: number): string {
  return numberFormatter({ maximumFractionDigits: 0 }).format(Math.round(value));
}

/** Decimal with up to `digits` decimals in the active locale, e.g. 75.5 → "75,5" or "75.5". */
export function formatDecimal(value: number, digits = 1): string {
  return numberFormatter({ maximumFractionDigits: digits }).format(value);
}

/** Decimal with exactly `digits` decimals, e.g. 75 → "75,0". */
export function formatFixed(value: number, digits = 1): string {
  return numberFormatter({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** The active locale's decimal separator ("," or "."), for parsing typed numbers. */
export function decimalSeparator(): string {
  return numberFormatter({ minimumFractionDigits: 1 }).format(1.5).charAt(1);
}

/** Parses a number typed by the user; accepts both "," and "." as the decimal separator. */
export function parseDecimal(text: string): number {
  const cleaned = text.replace(/[\s  ]/g, '').replace(',', '.');
  return cleaned === '' ? Number.NaN : Number(cleaned);
}

/** "1 serving" or "3 servings" in the active language. */
export function formatServings(count: number): string {
  return count === 1 ? strings.common.servingsOne : format(strings.common.servings, { count });
}
