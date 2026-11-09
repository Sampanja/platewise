import { fi } from './fi';

/** Active locale. MVP ships Finnish only. */
export const strings = fi;

/** Replaces `{key}` placeholders in a localised string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const euroFormatter = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 0 });

/** Formats a euro amount the Finnish way, e.g. 4.2 → "4,20 €". */
export function formatEuro(amount: number): string {
  return `${euroFormatter.format(amount)} €`;
}

/** Formats cents as euros, e.g. 420 → "4,20 €". */
export function formatCents(cents: number): string {
  return formatEuro(cents / 100);
}

/** Whole euros without decimals, e.g. 6600 → "66 €". For budgets and round-up suggestions. */
export function formatWholeEuros(cents: number): string {
  return `${integerFormatter.format(Math.round(cents / 100))} €`;
}

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
