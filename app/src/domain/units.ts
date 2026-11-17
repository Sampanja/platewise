/**
 * Measurement units: the one place that converts between what the app stores
 * and what the user sees or types.
 *
 * Everything is stored and calculated in metric: grams, millilitres,
 * kilograms, centimetres, kilocalories and degrees Celsius. The user picks
 * each displayed unit separately (`UnitPrefs`); conversions happen only when a
 * value is shown (lib/amounts.ts formats it) or typed (the `…FromInput`
 * helpers below). Nutrient amounts (protein, fibre, vitamins) are always
 * grams, milligrams or micrograms, as on nutrition labels everywhere.
 */

export const WEIGHT_UNITS = ['kg', 'lb', 'st'] as const;
export const HEIGHT_UNITS = ['cm', 'ftin'] as const;
export const FOOD_UNITS = ['g', 'oz'] as const;
export const LIQUID_UNITS = ['ml', 'cup'] as const;
export const ENERGY_UNITS = ['kcal', 'kj'] as const;
export const TEMPERATURE_UNITS = ['c', 'f'] as const;

/** Body weight: kilograms, pounds, or stones and pounds. */
export type WeightUnit = (typeof WEIGHT_UNITS)[number];
/** Height: centimetres or feet and inches. */
export type HeightUnit = (typeof HEIGHT_UNITS)[number];
/** Food amounts: g and kg, or oz and lb. */
export type FoodUnit = (typeof FOOD_UNITS)[number];
/** Liquids: ml, dl and l, or US fl oz and cups. */
export type LiquidUnit = (typeof LIQUID_UNITS)[number];
export type EnergyUnit = (typeof ENERGY_UNITS)[number];
/** Oven and food temperatures in recipes. */
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

export type UnitPrefs = {
  weight: WeightUnit;
  height: HeightUnit;
  food: FoodUnit;
  liquid: LiquidUnit;
  energy: EnergyUnit;
  temperature: TemperatureUnit;
};

export type UnitKind = keyof UnitPrefs;
export const UNIT_KINDS: readonly UnitKind[] = ['weight', 'height', 'food', 'liquid', 'energy', 'temperature'];

/** Choices per kind, in the order they are shown. */
export const UNIT_CHOICES: { readonly [K in UnitKind]: readonly UnitPrefs[K][] } = {
  weight: WEIGHT_UNITS,
  height: HEIGHT_UNITS,
  food: FOOD_UNITS,
  liquid: LIQUID_UNITS,
  energy: ENERGY_UNITS,
  temperature: TEMPERATURE_UNITS,
};

export const METRIC_UNITS: UnitPrefs = Object.freeze({
  weight: 'kg',
  height: 'cm',
  food: 'g',
  liquid: 'ml',
  energy: 'kcal',
  temperature: 'c',
});

/** US customary. Energy stays in calories: that is what US labels use too. */
export const IMPERIAL_UNITS: UnitPrefs = Object.freeze({
  weight: 'lb',
  height: 'ftin',
  food: 'oz',
  liquid: 'cup',
  energy: 'kcal',
  temperature: 'f',
});

export type UnitPreset = 'metric' | 'imperial' | 'custom';

export function sameUnits(a: UnitPrefs, b: UnitPrefs): boolean {
  return UNIT_KINDS.every((kind) => a[kind] === b[kind]);
}

/** Which quick choice the preferences match; anything else is "custom". */
export function unitPreset(prefs: UnitPrefs): UnitPreset {
  if (sameUnits(prefs, METRIC_UNITS)) return 'metric';
  if (sameUnits(prefs, IMPERIAL_UNITS)) return 'imperial';
  return 'custom';
}

export function isUnitPrefs(value: unknown): value is UnitPrefs {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return UNIT_KINDS.every((kind) => (UNIT_CHOICES[kind] as readonly unknown[]).includes(record[kind]));
}

/** Countries that measure food and bodies in US customary units. */
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM']);

/**
 * Suggested units for a new user from the phone's settings. The user always
 * sees and confirms them in onboarding. The phone's own measurement system
 * wins ("us" → imperial); otherwise the region. The UK cooks in grams and
 * millilitres but weighs people in stones and measures height in feet.
 */
export function defaultUnits(measurementSystem: string | null | undefined, regionCode: string | null | undefined): UnitPrefs {
  const region = regionCode?.toUpperCase() ?? null;
  if (measurementSystem === 'us') return { ...IMPERIAL_UNITS };
  if (measurementSystem === 'uk' || (measurementSystem == null && region === 'GB')) {
    return { ...METRIC_UNITS, weight: 'st', height: 'ftin' };
  }
  if (measurementSystem === 'metric') return { ...METRIC_UNITS };
  return region && IMPERIAL_REGIONS.has(region) ? { ...IMPERIAL_UNITS } : { ...METRIC_UNITS };
}

/** The old single metric/imperial setting as separate units (profile v10 migration). */
export function unitsFromSystem(system: 'metric' | 'imperial'): UnitPrefs {
  return { ...(system === 'imperial' ? IMPERIAL_UNITS : METRIC_UNITS) };
}

// ── Conversion factors ──────────────────────────────────────────────────────

export const GRAMS_PER_OUNCE = 28.349523125;
export const GRAMS_PER_POUND = 453.59237;
export const KG_PER_POUND = GRAMS_PER_POUND / 1000;
export const POUNDS_PER_STONE = 14;
export const CM_PER_INCH = 2.54;
export const ML_PER_FL_OZ = 29.5735295625;
/** US customary cup. */
export const ML_PER_CUP = 236.5882365;
export const ML_PER_TBSP = ML_PER_CUP / 16;
export const ML_PER_TSP = ML_PER_TBSP / 3;
/** Thermochemical calorie, as on EU and US labels. */
export const KJ_PER_KCAL = 4.184;

export function kgToLb(kg: number): number {
  return kg / KG_PER_POUND;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_POUND;
}

export function gToOz(g: number): number {
  return g / GRAMS_PER_OUNCE;
}

export function ozToG(oz: number): number {
  return oz * GRAMS_PER_OUNCE;
}

export function mlToFlOz(ml: number): number {
  return ml / ML_PER_FL_OZ;
}

export function flOzToMl(flOz: number): number {
  return flOz * ML_PER_FL_OZ;
}

export function kcalToKj(kcal: number): number {
  return kcal * KJ_PER_KCAL;
}

export function kjToKcal(kj: number): number {
  return kj / KJ_PER_KCAL;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

/** 180 cm → { feet: 5, inches: 11 }. Inches are whole; 12 in rolls over to the next foot. */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

/**
 * 72 kg → { stones: 11, pounds: 4.7 }: pounds to one decimal; 14 lb rolls
 * over to the next stone.
 */
export function kgToStonesPounds(kg: number): { stones: number; pounds: number } {
  const totalTenths = Math.round(kgToLb(kg) * 10);
  const stoneTenths = POUNDS_PER_STONE * 10;
  return { stones: Math.floor(totalTenths / stoneTenths), pounds: (totalTenths % stoneTenths) / 10 };
}

export function stonesPoundsToKg(stones: number, pounds: number): number {
  return lbToKg(stones * POUNDS_PER_STONE + pounds);
}

// ── Rounding ────────────────────────────────────────────────────────────────

/** Rounds to `digits` decimals without binary noise (0.1 + 0.2 → 0.3). */
export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Body weight in the chosen unit to 0.1 (kg or lb); stones show their pounds to 0.1. */
export function displayWeight(kg: number, unit: WeightUnit): number {
  return roundTo(unit === 'kg' ? kg : kgToLb(kg), 1);
}

/** A typed body weight (kg or lb; stones use `stonesPoundsToKg`) back to kilograms. */
export function weightToKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : lbToKg(value);
}

/** Steps for body weight inputs: 0.1 kg or 0.2 lb (about the same). */
export function weightStep(unit: WeightUnit): number {
  return unit === 'kg' ? 0.1 : 0.2;
}

/** Energy in the chosen unit, whole numbers (kcal or kJ). */
export function displayEnergy(kcal: number, unit: EnergyUnit): number {
  return Math.round(unit === 'kj' ? kcalToKj(kcal) : kcal);
}

/** Typed energy back to kcal. */
export function energyToKcal(value: number, unit: EnergyUnit): number {
  return unit === 'kj' ? kjToKcal(value) : value;
}

/**
 * Celsius to the chosen unit, rounded the way people set an oven: oven
 * temperatures (100 °C and up) to the nearest 25 °F (200 °C → 400 °F),
 * food temperatures to the nearest 5 °F (75 °C → 165 °F, 63 °C → 145 °F).
 */
export function displayTemperature(c: number, unit: TemperatureUnit): number {
  if (unit === 'c') return Math.round(c);
  const f = cToF(c);
  const step = c >= 100 ? 25 : 5;
  return Math.round(f / step) * step;
}

/** Liquid amount in the chosen unit's base (ml or fl oz). */
export function displayLiquid(ml: number, unit: LiquidUnit): number {
  return unit === 'ml' ? ml : mlToFlOz(ml);
}

/** Typed ml or fl oz back to millilitres. */
export function liquidToMl(value: number, unit: LiquidUnit): number {
  return unit === 'ml' ? value : flOzToMl(value);
}

/** Food amount in the chosen unit's base (g or oz). */
export function displayFood(grams: number, unit: FoodUnit): number {
  return unit === 'g' ? grams : gToOz(grams);
}

/** Typed grams or ounces back to grams. */
export function foodToGrams(value: number, unit: FoodUnit): number {
  return unit === 'g' ? value : ozToG(value);
}

/**
 * Snaps a count to a practical kitchen fraction: quarters below 1 (¼ cup),
 * halves up to 10 (1 ½ cups), whole numbers above. Never rounds to zero.
 */
export function practicalAmount(value: number): number {
  if (value <= 0) return 0;
  if (value < 1) return Math.max(0.25, Math.round(value * 4) / 4);
  if (value < 10) return Math.round(value * 2) / 2;
  return Math.round(value);
}
