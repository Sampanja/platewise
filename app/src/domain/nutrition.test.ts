import { describe, expect, it } from '@jest/globals';

import { energyFromMacros, energyMismatch, parseAmount } from './nutrition';

describe('energyMismatch', () => {
  it('accepts label values that add up within rounding', () => {
    // Oat flakes label: 389 kcal, P 12, C 63, F 7.5, fibre 9.5 → 384 kcal.
    expect(energyMismatch({ kcal: 389, proteinG: 12, carbsG: 63, fatG: 7.5, fiberG: 9.5 })).toBeNull();
  });
  it('flags values that clearly do not match', () => {
    expect(energyMismatch({ kcal: 100, proteinG: 20, carbsG: 30, fatG: 10 })).toBe(290);
  });
  it('uses 4/4/9 and 2 for fibre', () => {
    expect(energyFromMacros({ kcal: 0, proteinG: 1, carbsG: 1, fatG: 1, fiberG: 1 })).toBe(19);
  });
});

describe('parseAmount', () => {
  it('reads Finnish decimals and rejects junk', () => {
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount(' 3 ')).toBe(3);
    expect(parseAmount('')).toBeUndefined();
    expect(parseAmount('abc')).toBeUndefined();
    expect(parseAmount('-2')).toBeUndefined();
  });
});
