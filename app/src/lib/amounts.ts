import type { Ingredient } from '@/data/types';
import { cmToFeetInches, displayWeight, gToOz, ML_PER_CUP, mlToFlOz, type UnitSystem } from '@/domain/units';
import { format, formatDecimal, formatInteger, strings } from '@/i18n';
import { activeUnitSystem } from '@/i18n/locale';

/**
 * Display of amounts in the user's unit system. Everything is stored in grams,
 * millilitres, kilograms and centimetres; these helpers only format.
 */

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

/** Grams rounded sensibly: 3 g, 45 g, 125 g, 1,2 kg – or 0.5 oz, 4 ½ oz, 1.2 lb. */
export function formatGrams(grams: number, system: UnitSystem = activeUnitSystem()): string {
  const u = strings.units;
  if (system === 'imperial') {
    const oz = gToOz(grams);
    if (oz >= 16) return format(u.lb, { value: formatDecimal(oz / 16, 1) });
    if (oz < 1) return format(u.oz, { value: formatDecimal(Math.max(0.1, oz), 1) });
    return format(u.oz, { value: formatCount(oz) });
  }
  if (grams >= 1000) return format(u.kg, { value: formatDecimal(grams / 1000, 1) });
  const rounded = grams < 10 ? Math.max(1, Math.round(grams)) : Math.round(grams / 5) * 5;
  return format(u.g, { value: formatInteger(rounded) });
}

/** Millilitres as tsp, tbsp, dl or l – or US teaspoons, tablespoons and cups (1 g ≈ 1 ml for liquids). */
export function formatLiquid(ml: number, system: UnitSystem = activeUnitSystem()): string {
  const u = strings.units;
  if (system === 'imperial') {
    if (ml < 12) return format(u.tsp, { value: formatCount(ml / 4.93) });
    if (ml < 55) return format(u.tbsp, { value: formatCount(ml / 14.79) });
    const cups = ml / ML_PER_CUP;
    // Singular for what is shown: 1.01 cups reads "1 cup".
    const shown = cups < 1 ? Math.round(cups * 4) / 4 : Math.round(cups * 2) / 2;
    return format(shown <= 1 ? u.cup : u.cups, { value: formatCount(cups) });
  }
  if (ml < 12) return format(u.tsp, { value: formatCount(ml / 5) });
  if (ml < 50) return format(u.tbsp, { value: formatCount(ml / 15) });
  if (ml < 1000) return format(u.dl, { value: formatDecimal(Math.round(ml / 50) / 2, 1) });
  return format(u.l, { value: formatDecimal(Math.round(ml / 100) / 10, 1) });
}

/** Amount of an ingredient in the way people measure it at home. */
export function formatAmount(ingredient: Ingredient, grams: number, system: UnitSystem = activeUnitSystem()): string {
  const display = ingredient.display;
  if (display.kind === 'piece') {
    const count = grams / display.grams;
    const rounded = count < 1 ? Math.round(count * 4) / 4 : Math.round(count * 2) / 2;
    return `${formatCount(count)} ${rounded === 1 ? display.one : display.many}`;
  }
  if (display.kind === 'liquid') return formatLiquid(grams, system);
  return formatGrams(grams, system);
}

/** Package size for the shopping list, e.g. "400 g", "1 l", "1 ruukku" – or "14 oz", "34 fl oz". */
export function formatPackage(ingredient: Ingredient, system: UnitSystem = activeUnitSystem()): string {
  if (ingredient.packageLabel) return ingredient.packageLabel;
  const display = ingredient.display;
  // Loose produce sold by the piece (lemon, pepper): "1 kpl" reads better than grams.
  if (display.kind === 'piece' && ingredient.packageG / display.grams <= 4) {
    return format(strings.units.pcs, { value: Math.round(ingredient.packageG / display.grams) });
  }
  if (display.kind === 'liquid') {
    if (system === 'imperial') return format(strings.units.flOz, { value: formatInteger(mlToFlOz(ingredient.packageG)) });
    return ingredient.packageG >= 1000
      ? format(strings.units.l, { value: formatDecimal(ingredient.packageG / 1000, 1) })
      : format(strings.units.dl, { value: formatDecimal(ingredient.packageG / 100, 1) });
  }
  if (system === 'imperial') return format(strings.units.oz, { value: formatInteger(gToOz(ingredient.packageG)) });
  return formatGrams(ingredient.packageG, system);
}

/** Body weight: "72,5 kg" or "159.8 lb" (rates use 2 decimals: "0,25 kg"). */
export function formatBodyWeight(kg: number, system: UnitSystem = activeUnitSystem(), digits = 1): string {
  const value = formatDecimal(displayWeight(kg, system), digits);
  return format(system === 'imperial' ? strings.units.lb : strings.units.kg, { value });
}

/** A change in body weight with its sign: "+0,4 kg", "−0.9 lb". */
export function formatWeightChange(kg: number, system: UnitSystem = activeUnitSystem(), digits = 1): string {
  const value = displayWeight(Math.abs(kg), system);
  const sign = kg > 0.0001 ? '+' : kg < -0.0001 ? '−' : '';
  return `${sign}${format(system === 'imperial' ? strings.units.lb : strings.units.kg, { value: formatDecimal(value, digits) })}`;
}

/** Height: "180 cm" or "5 ft 11 in". */
export function formatHeight(cm: number, system: UnitSystem = activeUnitSystem()): string {
  if (system === 'imperial') {
    const { feet, inches } = cmToFeetInches(cm);
    return format(strings.units.ftIn, { ft: feet, in: inches });
  }
  return format(strings.units.cm, { value: formatInteger(cm) });
}

/** Daily water amounts: "1,5 l" or "51 fl oz". */
export function formatWater(ml: number, system: UnitSystem = activeUnitSystem()): string {
  if (system === 'imperial') return format(strings.units.flOz, { value: formatInteger(mlToFlOz(ml)) });
  return format(strings.units.l, { value: formatDecimal(ml / 1000, 2) });
}

/** A single drink: "2 dl", "3,3 dl" or "7 fl oz". */
export function formatDrink(ml: number, system: UnitSystem = activeUnitSystem()): string {
  if (system === 'imperial') return format(strings.units.flOz, { value: formatInteger(mlToFlOz(ml)) });
  return format(strings.units.dl, { value: formatDecimal(ml / 100, ml % 100 === 0 ? 0 : 1) });
}

/** A day's water without the unit, for chart labels: "1,5" (litres) or "51" (fl oz). */
export function formatWaterBare(ml: number, system: UnitSystem = activeUnitSystem()): string {
  return system === 'imperial' ? formatInteger(mlToFlOz(ml)) : formatDecimal(ml / 1000, 1);
}
