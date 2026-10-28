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

/** Formats a euro amount the Finnish way, e.g. 4.2 → "4,20 €". */
export function formatEuro(amount: number): string {
  return `${euroFormatter.format(amount)} €`;
}
