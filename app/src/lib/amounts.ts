import type { Ingredient } from '@/data/types';
import { format, formatInteger, strings } from '@/i18n';

const decimal = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 1 });

const FRACTIONS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

/** 0.5 → "½", 1.5 → "1 ½", 2 → "2". Small counts snap to quarters, larger to halves. */
export function formatCount(count: number): string {
  const step = count < 1 ? 0.25 : 0.5;
  const rounded = Math.max(0.25, Math.round(count / step) * step);
  const whole = Math.floor(rounded);
  const fraction = FRACTIONS[String(rounded - whole)];
  if (!fraction) return formatInteger(rounded);
  return whole === 0 ? fraction : `${whole} ${fraction}`;
}

/** Grams rounded sensibly: 3 g, 45 g, 125 g, 1,2 kg. */
export function formatGrams(grams: number): string {
  if (grams >= 1000) return format(strings.units.kg, { value: decimal.format(grams / 1000) });
  const rounded = grams < 10 ? Math.max(1, Math.round(grams)) : Math.round(grams / 5) * 5;
  return format(strings.units.g, { value: formatInteger(rounded) });
}

/** Millilitres as tsp, tbsp, dl or l (1 g ≈ 1 ml for liquids). */
export function formatLiquid(ml: number): string {
  const u = strings.units;
  if (ml < 12) return format(u.tsp, { value: formatCount(ml / 5) });
  if (ml < 50) return format(u.tbsp, { value: formatCount(ml / 15) });
  if (ml < 1000) return format(u.dl, { value: decimal.format(Math.round(ml / 50) / 2) });
  return format(u.l, { value: decimal.format(Math.round(ml / 100) / 10) });
}

/** Amount of an ingredient in the way people measure it at home. */
export function formatAmount(ingredient: Ingredient, grams: number): string {
  const display = ingredient.display;
  if (display.kind === 'piece') {
    const count = grams / display.grams;
    const rounded = count < 1 ? Math.round(count * 4) / 4 : Math.round(count * 2) / 2;
    return `${formatCount(count)} ${rounded === 1 ? display.one : display.many}`;
  }
  if (display.kind === 'liquid') return formatLiquid(grams);
  return formatGrams(grams);
}

/** Package size for the shopping list, e.g. "400 g", "1 l", "1 ruukku". */
export function formatPackage(ingredient: Ingredient): string {
  if (ingredient.packageLabel) return ingredient.packageLabel;
  const display = ingredient.display;
  // Loose produce sold by the piece (lemon, pepper): "1 kpl" reads better than grams.
  if (display.kind === 'piece' && ingredient.packageG / display.grams <= 4) {
    return format(strings.units.pcs, { value: Math.round(ingredient.packageG / display.grams) });
  }
  if (display.kind === 'liquid') {
    return ingredient.packageG >= 1000
      ? format(strings.units.l, { value: decimal.format(ingredient.packageG / 1000) })
      : format(strings.units.dl, { value: decimal.format(ingredient.packageG / 100) });
  }
  return formatGrams(ingredient.packageG);
}
