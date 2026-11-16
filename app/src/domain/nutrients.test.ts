import { describe, expect, it } from '@jest/globals';

import { FOODS, INGREDIENTS } from '@/data/catalog';

import { lowNutrients, NUTRIENTS, nutrientReference, nutrientShare, nutrientTotal } from './nutrients';

const adult = { age: 40, pregnancy: 'none' as const, kcal: 2000 };

describe('nutrientReference (NNR2023)', () => {
  it('differs by sex where the recommendations do', () => {
    const woman = nutrientReference({ ...adult, sex: 'female' });
    const man = nutrientReference({ ...adult, sex: 'male' });
    expect(woman.ironMg).toBe(15);
    expect(man.ironMg).toBe(9);
    expect(woman.vitCMg).toBe(95);
    expect(man.vitCMg).toBe(110);
    expect(woman.fiberG).toBe(25);
    expect(man.fiberG).toBe(35);
  });

  it('follows age and pregnancy', () => {
    expect(nutrientReference({ ...adult, sex: 'female', age: 60 }).ironMg).toBe(9);
    expect(nutrientReference({ ...adult, sex: 'male', age: 80 }).vitDUg).toBe(20);
    expect(nutrientReference({ ...adult, sex: 'female', age: 20 }).calciumMg).toBe(1000);
    expect(nutrientReference({ ...adult, sex: 'female', pregnancy: 'pregnant' }).folateUg).toBe(500);
  });

  it('keeps salt at 5 g and saturated fat under 10 % of energy', () => {
    const ref = nutrientReference({ ...adult, sex: null });
    expect(ref.saltG).toBe(5);
    expect(ref.satFatG).toBe(22);
  });

  it('has a reference for every target and limit nutrient', () => {
    const ref = nutrientReference({ ...adult, sex: null });
    for (const n of NUTRIENTS) if (n.kind !== 'info') expect(ref[n.key]).toBeGreaterThan(0);
  });
});

describe('totals and shares', () => {
  it('sums only known values', () => {
    expect(nutrientTotal([{ vitCMg: 10 }, {}, { vitCMg: 5 }], 'vitCMg')).toBe(15);
    expect(nutrientTotal([{}, {}], 'vitCMg')).toBeUndefined();
    expect(nutrientShare(50, 100)).toBe(0.5);
    expect(nutrientShare(undefined, 100)).toBeNull();
  });

  it('names nutrients clearly under their target, never limits', () => {
    const ref = nutrientReference({ ...adult, sex: 'female' });
    expect(lowNutrients({ vitDUg: 2, vitCMg: 90, saltG: 0 }, ref)).toEqual(['vitDUg']);
  });
});

describe('catalog nutrients from Fineli', () => {
  it('every ingredient and diary food has vitamins and minerals', () => {
    for (const item of [...INGREDIENTS, ...FOODS]) {
      for (const n of NUTRIENTS) expect(item.per100g[n.key]).toBeGreaterThanOrEqual(0);
    }
  });
});
