import type { Ingredient } from '@/data/types';
import {
  cmToFeetInches,
  displayEnergy,
  displayTemperature,
  displayWeight,
  energyToKcal,
  foodToGrams,
  gToOz,
  HEIGHT_UNITS,
  kgToStonesPounds,
  ML_PER_CUP,
  ML_PER_TBSP,
  ML_PER_TSP,
  mlToFlOz,
  practicalAmount,
  roundTo,
  type EnergyUnit,
  type FoodUnit,
  type HeightUnit,
  type LiquidUnit,
  type TemperatureUnit,
  type WeightUnit,
  WEIGHT_UNITS,
} from '@/domain/units';
import { format, formatDecimal, formatInteger, strings } from '@/i18n';
import { activeLanguage, activeUnits } from '@/i18n/locale';

/**
 * Display of amounts in the user's units. Everything is stored in grams,
 * millilitres, kilograms, centimetres, kcal and °C; these helpers only format.
 * Conversions live in domain/units.ts. No other file writes a unit symbol:
 * the lint rule `platepal/no-hardcoded-units` and i18n/units.test.ts check it.
 */

const FRACTIONS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

/** 0.5 → "½", 1.5 → "1 ½", 2 → "2". Small counts snap to quarters, larger to halves. */
export function formatCount(count: number): string {
  const rounded = Math.max(0.25, practicalAmount(count));
  const whole = Math.floor(rounded);
  const fraction = FRACTIONS[String(rounded - whole)];
  if (!fraction) return formatInteger(rounded);
  return whole === 0 ? fraction : `${whole} ${fraction}`;
}

// ── Energy ──────────────────────────────────────────────────────────────────

/** "1 850 kcal" or "7 740 kJ". */
export function formatEnergy(kcal: number, unit: EnergyUnit = activeUnits().energy): string {
  return format(unit === 'kj' ? strings.units.kj : strings.units.kcal, { value: formatInteger(displayEnergy(kcal, unit)) });
}

/** The number alone, for rings and big numbers next to `energyUnitLabel`. */
export function formatEnergyBare(kcal: number, unit: EnergyUnit = activeUnits().energy): string {
  return formatInteger(displayEnergy(kcal, unit));
}

/** "kcal" or "kJ". */
export function energyUnitLabel(unit: EnergyUnit = activeUnits().energy): string {
  return unit === 'kj' ? strings.unitNames.kj : strings.unitNames.kcal;
}

/** A number typed in the user's energy unit, back to kcal (whole). */
export function energyFromInput(value: number, unit: EnergyUnit = activeUnits().energy): number {
  return Math.round(energyToKcal(value, unit));
}

/** Energy value for an input field in the user's unit. */
export function energyToInput(kcal: number, unit: EnergyUnit = activeUnits().energy): number {
  return displayEnergy(kcal, unit);
}

// ── Food amounts ────────────────────────────────────────────────────────────

/** Grams rounded sensibly: 3 g, 45 g, 125 g, 1,2 kg – or 0.5 oz, 4 ½ oz, 1.2 lb. */
export function formatGrams(grams: number, unit: FoodUnit = activeUnits().food): string {
  const u = strings.units;
  if (unit === 'oz') {
    const oz = gToOz(grams);
    if (oz >= 16) return format(u.lb, { value: formatDecimal(oz / 16, 1) });
    if (oz < 1) return format(u.oz, { value: formatDecimal(Math.max(0.1, oz), 1) });
    return format(u.oz, { value: formatCount(oz) });
  }
  if (grams >= 1000) return format(u.kg, { value: formatDecimal(grams / 1000, 1) });
  const rounded = grams < 10 ? Math.max(1, Math.round(grams)) : Math.round(grams / 5) * 5;
  return format(u.g, { value: formatInteger(rounded) });
}

/** Grams exactly as typed or weighed ("137 g" or "4.8 oz"), for editors and review lists. */
export function formatGramsExact(grams: number, unit: FoodUnit = activeUnits().food): string {
  if (unit === 'oz') return format(strings.units.oz, { value: formatDecimal(gToOz(grams), 1) });
  return format(strings.units.g, { value: formatInteger(grams) });
}

/** "g" or "oz" next to an amount field. */
export function foodUnitLabel(unit: FoodUnit = activeUnits().food): string {
  return unit === 'oz' ? strings.unitNames.oz : strings.unitNames.g;
}

/** Nutrient grams (protein, fibre…): always grams, as on every nutrition label. */
export function formatNutrientGrams(grams: number, digits = 0): string {
  return format(strings.units.g, { value: digits ? formatDecimal(grams, digits) : formatInteger(grams) });
}

/** Millilitres as tsp, tbsp, dl or l – or US teaspoons, tablespoons and cups (1 g ≈ 1 ml for liquids). */
export function formatLiquid(ml: number, unit: LiquidUnit = activeUnits().liquid): string {
  const u = strings.units;
  if (unit === 'cup') {
    if (ml < 12) return format(u.tsp, { value: formatCount(ml / ML_PER_TSP) });
    if (ml < 55) return format(u.tbsp, { value: formatCount(ml / ML_PER_TBSP) });
    const cups = ml / ML_PER_CUP;
    // Singular for what is shown: 1.01 cups reads "1 cup"; Finnish fractions take the partitive ("¾ kuppia").
    const shown = practicalAmount(cups);
    const singular = shown === 1 || (shown < 1 && activeLanguage() !== 'fi');
    return format(singular ? u.cup : u.cups, { value: formatCount(cups) });
  }
  if (ml < 12) return format(u.tsp, { value: formatCount(ml / 5) });
  if (ml < 50) return format(u.tbsp, { value: formatCount(ml / 15) });
  if (ml < 1000) return format(u.dl, { value: formatDecimal(Math.round(ml / 50) / 2, 1) });
  return format(u.l, { value: formatDecimal(Math.round(ml / 100) / 10, 1) });
}

/** Amount of an ingredient in the way people measure it at home. */
export function formatAmount(ingredient: Ingredient, grams: number, units = activeUnits()): string {
  const display = ingredient.display;
  if (display.kind === 'piece') {
    const count = grams / display.grams;
    const rounded = practicalAmount(count);
    // "1 sipuli" but "½ sipulia" in Finnish (partitive); "½ onion" and "½ lök" elsewhere.
    const singular = rounded === 1 || (rounded < 1 && activeLanguage() !== 'fi');
    return `${formatCount(count)} ${singular ? display.one : display.many}`;
  }
  if (display.kind === 'liquid') return formatLiquid(grams, units.liquid);
  return formatGrams(grams, units.food);
}

/** Package size for the shopping list, e.g. "400 g", "1 l", "1 ruukku" – or "14 oz", "2.2 lb", "34 fl oz". */
export function formatPackage(ingredient: Ingredient, units = activeUnits()): string {
  if (ingredient.packageLabel) return ingredient.packageLabel;
  const display = ingredient.display;
  // Loose produce sold by the piece (lemon, pepper): "1 kpl" reads better than grams.
  if (display.kind === 'piece' && ingredient.packageG / display.grams <= 4) {
    const pieces = Math.round(ingredient.packageG / display.grams);
    return pieces === 1 ? strings.units.pcsOne : format(strings.units.pcs, { value: pieces });
  }
  if (display.kind === 'liquid') {
    if (units.liquid === 'cup') return format(strings.units.flOz, { value: formatInteger(mlToFlOz(ingredient.packageG)) });
    return ingredient.packageG >= 1000
      ? format(strings.units.l, { value: formatDecimal(ingredient.packageG / 1000, 1) })
      : format(strings.units.dl, { value: formatDecimal(ingredient.packageG / 100, 1) });
  }
  if (units.food === 'oz') {
    // US labels: "14 oz" up to a pound, "2.2 lb" above it.
    const oz = gToOz(ingredient.packageG);
    if (oz > 16.5) return format(strings.units.lb, { value: formatDecimal(oz / 16, 1) });
    return format(strings.units.oz, { value: formatInteger(oz) });
  }
  return formatGrams(ingredient.packageG, units.food);
}

// ── Body ────────────────────────────────────────────────────────────────────

/** Body weight: "72,5 kg", "159.8 lb" or "11 st 6.4 lb" (rates use 2 decimals: "0,25 kg"). */
export function formatBodyWeight(kg: number, unit: WeightUnit = activeUnits().weight, digits = 1): string {
  if (unit === 'st' && kg >= 6.35) {
    const { stones, pounds } = kgToStonesPounds(kg);
    return format(strings.units.st, { st: stones, lb: formatDecimal(pounds, 1) });
  }
  const shown = unit === 'kg' ? kg : displayWeight(kg, 'lb');
  return format(unit === 'kg' ? strings.units.kg : strings.units.lb, { value: formatDecimal(shown, digits) });
}

/** A change in body weight with its sign: "+0,4 kg", "−0.9 lb" (stones show changes in pounds). */
export function formatWeightChange(kg: number, unit: WeightUnit = activeUnits().weight, digits = 1): string {
  const shownUnit: WeightUnit = unit === 'st' ? 'lb' : unit;
  const value = unit === 'kg' ? Math.abs(kg) : displayWeight(Math.abs(kg), 'lb');
  const sign = kg > 0.0001 ? '+' : kg < -0.0001 ? '−' : '';
  return `${sign}${format(shownUnit === 'kg' ? strings.units.kg : strings.units.lb, { value: formatDecimal(value, digits) })}`;
}

/** A body weight without its unit for chart axes: "72,5" or "159.8" (stones: total pounds). */
export function formatWeightBare(kg: number, unit: WeightUnit = activeUnits().weight): string {
  return formatDecimal(displayWeight(kg, unit === 'kg' ? 'kg' : 'lb'), 1);
}

/** "kg" or "lb" for a weight field (stones are typed as stones and pounds). */
export function weightUnitLabel(unit: WeightUnit = activeUnits().weight): string {
  return unit === 'kg' ? strings.unitNames.kg : unit === 'st' ? strings.unitNames.st : strings.unitNames.lb;
}

/** Height: "180 cm" or "5 ft 11 in". */
export function formatHeight(cm: number, unit: HeightUnit = activeUnits().height): string {
  if (unit === 'ftin') {
    const { feet, inches } = cmToFeetInches(cm);
    return format(strings.units.ftIn, { ft: feet, in: inches });
  }
  return format(strings.units.cm, { value: formatInteger(cm) });
}

// ── Water ───────────────────────────────────────────────────────────────────

/** Daily water amounts: "1,5 l" or "51 fl oz". */
export function formatWater(ml: number, unit: LiquidUnit = activeUnits().liquid): string {
  if (unit === 'cup') return format(strings.units.flOz, { value: formatInteger(mlToFlOz(ml)) });
  return format(strings.units.l, { value: formatDecimal(ml / 1000, 2) });
}

/** A single drink: "2 dl", "3,3 dl" or "7 fl oz". */
export function formatDrink(ml: number, unit: LiquidUnit = activeUnits().liquid): string {
  if (unit === 'cup') return format(strings.units.flOz, { value: formatInteger(mlToFlOz(ml)) });
  return format(strings.units.dl, { value: formatDecimal(ml / 100, ml % 100 === 0 ? 0 : 1) });
}

/** A day's water without the unit, for chart labels: "1,5" (litres) or "51" (fl oz). */
export function formatWaterBare(ml: number, unit: LiquidUnit = activeUnits().liquid): string {
  return unit === 'cup' ? formatInteger(mlToFlOz(ml)) : formatDecimal(ml / 1000, 1);
}

/** "ml" or "fl oz" next to a liquid field. */
export function liquidUnitLabel(unit: LiquidUnit = activeUnits().liquid): string {
  return unit === 'cup' ? strings.unitNames.flOz : strings.unitNames.ml;
}

// ── Temperature ─────────────────────────────────────────────────────────────

/** "200 °C" or "400 °F". */
export function formatTemperature(c: number, unit: TemperatureUnit = activeUnits().temperature): string {
  return format(unit === 'f' ? strings.units.degF : strings.units.degC, { value: formatInteger(displayTemperature(c, unit)) });
}

const CELSIUS_IN_TEXT = /(\d{2,3})\s?°C/g;

/**
 * Recipe text with its temperatures in the user's unit. Catalog texts write
 * every temperature as "200 °C" (Finnish inflects after a colon: "200 °C:ssa"),
 * so this is the only conversion needed: "200 °C:ssa" → "400 °F:ssa".
 */
export function localizeTemperatures(text: string, unit: TemperatureUnit = activeUnits().temperature): string {
  if (unit === 'c' || !text.includes('°C')) return text;
  return text.replace(CELSIUS_IN_TEXT, (_match, value: string) => formatTemperature(Number(value), unit));
}

/** "2 dl", "0,5 dl", "200 ml", "1 l", "30 g", "1,2 kg" written in recipe text (not "g:n"-like words). */
const METRIC_AMOUNT_IN_TEXT = /(\d+(?:[.,]\d+)?)\s?(dl|ml|l|kg|g)(?![\p{L}\d])/gu;
const ML_PER: Record<string, number> = { ml: 1, dl: 100, l: 1000 };
const G_PER: Record<string, number> = { g: 1, kg: 1000 };

/**
 * Recipe steps and tips with their temperatures and amounts in the user's
 * units. Catalog texts are written metric ("Lisää 2 dl vettä", "200 °C");
 * with cups, ounces or °F they read "Lisää ¾ kuppia vettä", "400 °F".
 */
export function localizeRecipeText(text: string, units = activeUnits()): string {
  const withTemperatures = localizeTemperatures(text, units.temperature);
  if (units.liquid === 'ml' && units.food === 'g') return withTemperatures;
  return withTemperatures.replace(METRIC_AMOUNT_IN_TEXT, (match, raw: string, unit: string) => {
    const value = Number(raw.replace(',', '.'));
    if (unit in ML_PER) return units.liquid === 'cup' ? formatLiquid(value * ML_PER[unit], 'cup') : match;
    return units.food === 'oz' ? formatGrams(value * G_PER[unit], 'oz') : match;
  });
}

// ── Unit toggles next to fields ─────────────────────────────────────────────

/** kg | lb | st for a weight field's one-off unit switch. */
export function weightToggleOptions(): { value: WeightUnit; label: string }[] {
  return WEIGHT_UNITS.map((unit) => ({ value: unit, label: weightUnitLabel(unit) }));
}

/** cm | ft + in for a height field's one-off unit switch. */
export function heightToggleOptions(): { value: HeightUnit; label: string }[] {
  return HEIGHT_UNITS.map((unit) => ({ value: unit, label: unit === 'cm' ? strings.unitNames.cm : strings.unitNames.ftIn }));
}

// ── Food amount fields ──────────────────────────────────────────────────────

/** Grams as the text of an amount field in the user's unit: "137" or "4,8". */
export function foodInputText(grams: number, unit: FoodUnit = activeUnits().food): string {
  return unit === 'oz' ? formatDecimal(roundTo(gToOz(grams), 1), 1) : String(Math.round(grams));
}

/** A number typed in the user's food unit back to whole grams. */
export function gramsFromInput(value: number, unit: FoodUnit = activeUnits().food): number {
  return Math.max(0, Math.round(foodToGrams(value, unit)));
}

// ── Ranges ──────────────────────────────────────────────────────────────────

/** A body weight range: "0,5–2 kg" or "1.1–4.4 lb" (stones use pounds for small amounts). */
export function formatWeightRange(minKg: number, maxKg: number, unit: WeightUnit = activeUnits().weight): string {
  const shown: WeightUnit = unit === 'kg' ? 'kg' : 'lb';
  const value = `${formatDecimal(displayWeight(minKg, shown), 1)}–${formatDecimal(displayWeight(maxKg, shown), 1)}`;
  return format(shown === 'kg' ? strings.units.kg : strings.units.lb, { value });
}

/** A daily drinking range: "1–1,5 l" or "34–51 fl oz". */
export function formatWaterRange(minMl: number, maxMl: number, unit: LiquidUnit = activeUnits().liquid): string {
  if (unit === 'cup') {
    return format(strings.units.flOz, { value: `${formatInteger(mlToFlOz(minMl))}–${formatInteger(mlToFlOz(maxMl))}` });
  }
  return format(strings.units.l, { value: `${formatDecimal(minMl / 1000, 1)}–${formatDecimal(maxMl / 1000, 1)}` });
}
