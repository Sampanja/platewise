import { describe, expect, it } from '@jest/globals';

import {
  budgetBounds,
  ceilToWholeUnit,
  convertBudget,
  defaultWeeklyBudget,
  isRoughEstimate,
  PRICE_REGION_CODES,
  PRICE_REGIONS,
  priceFactor,
  priceRegionFor,
} from './priceRegion';

describe('price regions', () => {
  it('uses the Finnish prices unchanged in Finland', () => {
    expect(priceFactor('FI')).toBe(1);
    expect(defaultWeeklyBudget('FI')).toBe(7500);
    expect(budgetBounds('FI')).toEqual({ min: 1000, max: 30000, step: 100 });
    expect(isRoughEstimate('FI')).toBe(false);
  });

  it('marks every other region as a rough estimate', () => {
    for (const code of PRICE_REGION_CODES.filter((c) => c !== 'FI')) expect(isRoughEstimate(code)).toBe(true);
  });

  it('converts the price level and currency', () => {
    // 1 € in Finland ≈ 0.95 × 11.2 ≈ 10.6 kr in Sweden.
    expect(priceFactor('SE')).toBeCloseTo(10.64, 2);
    expect(defaultWeeklyBudget('SE')).toBe(80000);
    expect(budgetBounds('SE').step).toBe(1000);
  });

  it('picks the region from the phone region code, falling back to Finland', () => {
    expect(priceRegionFor('SE')).toBe('SE');
    expect(priceRegionFor('gb')).toBe('GB');
    expect(priceRegionFor('JP')).toBe('FI');
    expect(priceRegionFor(null)).toBe('FI');
  });

  it('keeps purchasing power when the region changes, within the bounds', () => {
    expect(convertBudget(7500, 'FI', 'FI')).toBe(7500);
    expect(convertBudget(7500, 'FI', 'SE')).toBe(80000);
    expect(convertBudget(80000, 'SE', 'FI')).toBe(7500);
    expect(convertBudget(100, 'FI', 'SE')).toBe(budgetBounds('SE').min);
  });

  it('rounds up to whole units', () => {
    expect(ceilToWholeUnit(4201)).toBe(4300);
    expect(ceilToWholeUnit(4200)).toBe(4200);
  });

  it('has sane data for every region', () => {
    for (const code of PRICE_REGION_CODES) {
      const region = PRICE_REGIONS[code];
      expect(region.code).toBe(code);
      expect(region.priceLevel).toBeGreaterThan(0.5);
      expect(region.priceLevel).toBeLessThan(2);
      expect(() => new Intl.NumberFormat('en', { style: 'currency', currency: region.currency })).not.toThrow();
    }
  });
});
