import type { Macros, MicroKey } from '@/data/types';

import type { PregnancyStatus, Sex } from './energy';

/**
 * Vitamins, minerals and other nutrients against the Nordic Nutrition
 * Recommendations 2023 (NNR2023, Nordic Council of Ministers): recommended
 * intakes (RI) or adequate intakes (AI) for adults by sex and age, and upper
 * guide values for salt and saturated fat. Pure and unit tested.
 *
 * The values describe; they never alarm. A day below a recommendation is
 * normal: intakes are meant as averages over weeks (reports show them).
 */

/** How a nutrient is compared: aim to reach (`target`), stay under (`limit`), or shown without a reference (`info`). */
export type NutrientKind = 'target' | 'limit' | 'info';

export type NutrientSpec = { key: MicroKey; unit: 'g' | 'mg' | 'µg'; kind: NutrientKind };

/** Display order: fibre and the "limit" group first, then vitamins, then minerals. */
export const NUTRIENTS: readonly NutrientSpec[] = [
  { key: 'fiberG', unit: 'g', kind: 'target' },
  { key: 'sugarG', unit: 'g', kind: 'info' },
  { key: 'saltG', unit: 'g', kind: 'limit' },
  { key: 'satFatG', unit: 'g', kind: 'limit' },
  { key: 'vitDUg', unit: 'µg', kind: 'target' },
  { key: 'vitCMg', unit: 'mg', kind: 'target' },
  { key: 'b12Ug', unit: 'µg', kind: 'target' },
  { key: 'folateUg', unit: 'µg', kind: 'target' },
  { key: 'ironMg', unit: 'mg', kind: 'target' },
  { key: 'calciumMg', unit: 'mg', kind: 'target' },
  { key: 'potassiumMg', unit: 'mg', kind: 'target' },
  { key: 'magnesiumMg', unit: 'mg', kind: 'target' },
  { key: 'zincMg', unit: 'mg', kind: 'target' },
];

export type NutrientPerson = {
  sex: Sex | null;
  /** Years; null when unknown (adult values are used). */
  age: number | null;
  pregnancy: PregnancyStatus;
  /** Daily energy goal, for saturated fat (< 10 % of energy). */
  kcal: number;
};

export type NutrientReference = Readonly<Partial<Record<MicroKey, number>>>;

/**
 * Daily reference per nutrient (NNR2023). Unknown sex uses the higher of the
 * two values where they differ, so nobody is told they reached a goal early;
 * under-18s get the 18–24 values (and 1 000 mg calcium).
 */
export function nutrientReference({ sex, age, pregnancy, kcal }: NutrientPerson): NutrientReference {
  const female = sex === 'female';
  const male = sex === 'male';
  const years = age ?? 40;
  const young = years < 25;
  const old = years >= 75;
  const fertileWoman = female && years < 51;
  const pregnantOrNursing = female && pregnancy !== 'none';
  return {
    // NNR2023: at least 25 g (women) / 35 g (men) a day; ≥ 3 g per MJ.
    fiberG: male ? 35 : female ? 25 : 30,
    saltG: 5,
    // Saturated fat < 10 % of energy (9 kcal per gram).
    satFatG: Math.round((kcal * 0.1) / 9),
    vitDUg: old ? 20 : 10,
    vitCMg: female ? (pregnantOrNursing ? (pregnancy === 'breastfeeding' ? 145 : 105) : 95) : 110,
    b12Ug: pregnancy === 'breastfeeding' && female ? 4.5 : 4,
    folateUg: pregnantOrNursing ? 500 : fertileWoman ? 400 : 330,
    ironMg: male ? 9 : fertileWoman ? 15 : female ? 9 : 15,
    calciumMg: young ? 1000 : 950,
    potassiumMg: male ? 3500 : female ? (pregnancy === 'breastfeeding' ? 4000 : 3500) : 3500,
    magnesiumMg: male ? 350 : female ? 300 : 350,
    // Zinc with a moderate phytate intake (mixed diet).
    zincMg: male ? 12.7 : female ? (pregnancy === 'breastfeeding' ? 11.7 : pregnancy === 'pregnant' ? 10.2 : 8.9) : 12.7,
  };
}

/** Value against the reference: 0–1+ for targets, 0–1+ of the limit for limits; null without a reference or value. */
export function nutrientShare(value: number | undefined, reference: number | undefined): number | null {
  if (value === undefined || reference === undefined || reference <= 0) return null;
  return value / reference;
}

/** Sum of the known values of one nutrient; undefined when no input has it. */
export function nutrientTotal(items: readonly Pick<Macros, MicroKey>[], key: MicroKey): number | undefined {
  let total: number | undefined;
  for (const item of items) {
    const value = item[key];
    if (value !== undefined) total = (total ?? 0) + value;
  }
  return total;
}

/**
 * Nutrients clearly below their recommendation (under half) on average,
 * for a gentle "where to get it" hint. Limits and info rows never qualify.
 */
export function lowNutrients(totals: Partial<Record<MicroKey, number>>, reference: NutrientReference, threshold = 0.5): MicroKey[] {
  return NUTRIENTS.filter((n) => n.kind === 'target')
    .map((n) => n.key)
    .filter((key) => {
      const share = nutrientShare(totals[key], reference[key]);
      return share !== null && share < threshold;
    });
}
