/**
 * Measurement units. Everything is stored and calculated in metric (grams,
 * millilitres, kilograms, centimetres); the unit system only changes what the
 * user sees and types. Weight and height follow the same setting as food
 * amounts: metric = g, kg, ml, dl, l, cm; imperial = oz, lb, fl oz, cups,
 * ft and in.
 */

export const UNIT_SYSTEMS = ['metric', 'imperial'] as const;
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

export function isUnitSystem(value: unknown): value is UnitSystem {
  return value === 'metric' || value === 'imperial';
}

/** Countries that measure food and bodies in imperial units. */
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM']);

/**
 * Default for the phone's settings: the phone's own measurement system when it
 * reports one ("us" → imperial), otherwise the region. The UK reports "uk" but
 * cooks in grams and millilitres, so it stays metric.
 */
export function defaultUnitSystem(measurementSystem: string | null | undefined, regionCode: string | null | undefined): UnitSystem {
  if (measurementSystem === 'us') return 'imperial';
  if (measurementSystem === 'metric' || measurementSystem === 'uk') return 'metric';
  return regionCode && IMPERIAL_REGIONS.has(regionCode.toUpperCase()) ? 'imperial' : 'metric';
}

export const GRAMS_PER_OUNCE = 28.349523125;
export const GRAMS_PER_POUND = 453.59237;
export const KG_PER_POUND = GRAMS_PER_POUND / 1000;
export const CM_PER_INCH = 2.54;
export const ML_PER_FL_OZ = 29.5735295625;
/** US customary cup. */
export const ML_PER_CUP = 236.5882365;

export function kgToLb(kg: number): number {
  return kg / KG_PER_POUND;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_POUND;
}

export function gToOz(g: number): number {
  return g / GRAMS_PER_OUNCE;
}

export function mlToFlOz(ml: number): number {
  return ml / ML_PER_FL_OZ;
}

export function flOzToMl(flOz: number): number {
  return flOz * ML_PER_FL_OZ;
}

/** 180 cm → { feet: 5, inches: 11 }. Inches are whole; 12 in rolls over to the next foot. */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

/** Body weight shown in the unit system, e.g. 75 kg → 165.3 lb. */
export function displayWeight(kg: number, system: UnitSystem): number {
  return system === 'imperial' ? kgToLb(kg) : kg;
}

/** A typed body weight back to kilograms. */
export function weightToKg(value: number, system: UnitSystem): number {
  return system === 'imperial' ? lbToKg(value) : value;
}

/** Steps for body weight inputs: 0.1 kg or 0.2 lb (about the same). */
export function weightStep(system: UnitSystem): number {
  return system === 'imperial' ? 0.2 : 0.1;
}
