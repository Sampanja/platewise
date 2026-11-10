import { describe, expect, it } from '@jest/globals';

import type { AllergenCode, Ingredient } from '../types';
import { FINELI } from './fineli.generated';
import { INGREDIENTS } from './ingredients';

/**
 * Every ingredient links to Fineli, its nutrients come from there, and its
 * hand-set allergens and diet tags agree with Fineli's special-diet flags.
 * Hand-set data may be stricter than Fineli (e.g. soy sauce is marked
 * gluten: most products contain wheat), never looser. Closest-match links
 * (`proxy`) are skipped in the flag checks because the Fineli food is not
 * the product itself; their allergens are set by hand.
 */

/** Fineli's "free from" flag for an allergen. */
const FREE_FLAG: Partial<Record<AllergenCode, string>> = {
  milk: 'MILKFREE',
  egg: 'EGGFREE',
  soy: 'SOYAFREE',
};

/**
 * Where Fineli lacks a "free from" flag although the product sold in Finland
 * is free from it (Fineli's flags are not complete). Each one was checked
 * against typical Finnish products; the reason is kept here so the
 * exception is a decision, not an accident.
 */
const KNOWN_GAPS: Record<string, string> = {
  'chanterelle: soy': 'A wild mushroom; Fineli just has no soy flag for it.',
  'tortilla: milk': 'Common Finnish wheat tortillas (Santa Maria, Poco Loco) are milk-free.',
  'tortilla: not vegan': 'Common Finnish wheat tortillas are vegan.',
  'corn-tortilla: milk': 'Corn tortillas are made of corn flour, water and salt.',
  'corn-tortilla: not vegan': 'Corn tortillas are vegan.',
  'oat-cream: egg': 'Oat cream contains no egg.',
  'oat-drink: soy': 'Oat drink contains no soy.',
  'cream-cheese: egg': 'Plain cream cheese contains no egg.',
  'gluten-free-pasta: soy': 'Typical gluten-free pasta is corn and rice.',
  'gluten-free-pasta: not vegan': 'Typical gluten-free pasta is corn and rice, without egg.',
  'pumpkin-seeds: egg': 'Plain seeds.',
  'black-beans: egg': 'Canned beans in brine.',
  'black-beans: soy': 'Canned beans in brine.',
  'black-beans: not vegan': 'Canned beans in brine.',
  'breadcrumbs: not vegan': 'Finnish breadcrumbs are wheat, water, yeast and salt.',
  'cheddar: lactose': 'Aged hard cheese is naturally lactose-free.',
  'chia: egg': 'Plain chia seeds.',
};

/** Ingredients whose Fineli food has diet flags and is the product itself. */
const CHECKED = INGREDIENTS.filter((i) => i.fineli.diets.length > 0 && !i.fineli.proxy);

function offenders(check: (ingredient: Ingredient) => string | null): string[] {
  return INGREDIENTS.map(check).filter((x): x is string => x !== null);
}

describe('Fineli ingredient table', () => {
  it('links every ingredient to a Fineli food', () => {
    expect(offenders((i) => (FINELI[i.fineli.id] ? null : i.id))).toEqual([]);
  });

  it('takes every nutrient from the linked Fineli food', () => {
    expect(
      offenders((i) => {
        const f = FINELI[i.fineli.id];
        const n = i.per100g;
        const same =
          n.kcal === f.kcal &&
          n.proteinG === f.proteinG &&
          n.carbsG === f.carbsG &&
          n.fatG === f.fatG &&
          n.fiberG === f.fiberG &&
          n.sugarG === f.sugarG &&
          n.saltG === f.saltG;
        return same ? null : i.id;
      }),
    ).toEqual([]);
  });

  it('has plausible energy for its macros', () => {
    expect(
      offenders(({ id, per100g: n }) => {
        if (n.kcal < 0 || n.kcal > 900) return id;
        // 4/4/9 kcal per g, fibre 2. Small amounts and spices are noisy, so only above 40 kcal.
        const fromMacros = n.proteinG * 4 + n.carbsG * 4 + n.fatG * 9 + (n.fiberG ?? 0) * 2;
        return n.kcal > 40 && Math.abs(fromMacros - n.kcal) / n.kcal > 0.25 ? `${id} ${n.kcal} vs ${Math.round(fromMacros)}` : null;
      }),
    ).toEqual([]);
  });

  it('checks most ingredients against Fineli flags', () => {
    expect(CHECKED.length).toBeGreaterThan(INGREDIENTS.length * 0.75);
  });

  it('never misses an allergen Fineli implies (milk, egg, soy)', () => {
    const missing = CHECKED.flatMap((i) =>
      (Object.entries(FREE_FLAG) as [AllergenCode, string][])
        .filter(([code, flag]) => !i.fineli.diets.includes(flag) && !i.allergens.includes(code))
        .map(([code]) => `${i.id}: ${code}`),
    ).filter((key) => !(key in KNOWN_GAPS));
    expect(missing).toEqual([]);
  });

  it('marks gluten whenever Fineli says the food is not gluten-free', () => {
    const missing = CHECKED.filter(
      (i) => !i.fineli.diets.includes('GLUTFREE') && !i.fineli.diets.includes('NAGLUFRE') && !i.allergens.includes('gluten'),
    ).map((i) => i.id);
    expect(missing).toEqual([]);
  });

  it('tags animal products the way Fineli classifies them', () => {
    const wrong = CHECKED.flatMap((i) => {
      const { diets } = i.fineli;
      const has = (list: string[]) => i.tags.some((t) => list.includes(t));
      const out: string[] = [];
      if (!diets.includes('LACOVEGE') && !has(['meat', 'fish', 'seafood'])) out.push(`${i.id}: not vegetarian`);
      if (diets.includes('LACOVEGE') && !diets.includes('VEGAN') && !has(['dairy', 'egg', 'honey', 'meat', 'fish', 'seafood']))
        out.push(`${i.id}: not vegan`);
      if (diets.includes('VEGAN') && i.tags.length > 0) out.push(`${i.id}: vegan but tagged`);
      if (!diets.includes('LACSFREE') && !diets.includes('LOWLACS') && i.allergens.includes('milk') && !i.tags.includes('lactose'))
        out.push(`${i.id}: lactose`);
      return out.filter((key) => !(key in KNOWN_GAPS));
    });
    expect(wrong).toEqual([]);
  });

  it('explains every closest-match link', () => {
    expect(offenders((i) => (i.fineli.proxy !== undefined && i.fineli.proxy.length < 20 ? i.id : null))).toEqual([]);
  });
});
