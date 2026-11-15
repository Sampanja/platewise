import type { PriceRegionCode } from '@/domain/priceRegion';

import { fi } from './fi';
import { activePriceRegion, CURRENCY_SYMBOLS, currencyOf, intlLocale } from './locale';

/** Active locale. MVP ships Finnish only. */
export const strings = fi;

/** Replaces `{key}` placeholders in a localised string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const moneyFormatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(region: PriceRegionCode, whole: boolean): Intl.NumberFormat {
  const key = [intlLocale(), region, whole].join('|');
  let formatter = moneyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocale(), {
      style: 'currency',
      currency: currencyOf(region),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    });
    moneyFormatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats an amount in minor units (cents, öre) in the price region's
 * currency, e.g. 420 → "4,20 €" or "4,20 kr". Defaults to the active region;
 * a saved plan passes its own.
 */
export function formatMoney(minor: number, region: PriceRegionCode = activePriceRegion()): string {
  return withSymbol(moneyFormatter(region, false).format(minor / 100), region);
}

/** Whole currency units without decimals, e.g. 6600 → "66 €". For budgets and round-up suggestions. */
export function formatWholeMoney(minor: number, region: PriceRegionCode = activePriceRegion()): string {
  return withSymbol(moneyFormatter(region, true).format(Math.round(minor / 100)), region);
}

/** Swaps an ISO code that Hermes printed in place of the symbol ("50,10 SEK" → "50,10 kr"). */
function withSymbol(formatted: string, region: PriceRegionCode): string {
  const code = currencyOf(region);
  const symbol = CURRENCY_SYMBOLS[code];
  return symbol && formatted.includes(code) ? formatted.replace(code, symbol) : formatted;
}

/** The currency symbol alone, e.g. "€" or "kr", for input fields. */
export function currencySymbol(region: PriceRegionCode = activePriceRegion()): string {
  return CURRENCY_SYMBOLS[currencyOf(region)] ?? currencyOf(region);
}

const integerFormatter = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 0 });

/** Rounds and groups thousands the Finnish way, e.g. 1240.4 → "1 240". */
export function formatInteger(value: number): string {
  return integerFormatter.format(Math.round(value));
}

const decimalFormatters = new Map<number, Intl.NumberFormat>();

/** Finnish decimal with up to `digits` decimals, e.g. 75.5 → "75,5". */
export function formatDecimal(value: number, digits = 1): string {
  let formatter = decimalFormatters.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: digits });
    decimalFormatters.set(digits, formatter);
  }
  return formatter.format(value);
}
