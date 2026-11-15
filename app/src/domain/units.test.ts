import { describe, expect, it } from '@jest/globals';

import {
  cmToFeetInches,
  defaultUnitSystem,
  displayWeight,
  feetInchesToCm,
  flOzToMl,
  gToOz,
  kgToLb,
  lbToKg,
  mlToFlOz,
  weightToKg,
} from './units';

describe('defaultUnitSystem', () => {
  it('follows the phone when it reports a system', () => {
    expect(defaultUnitSystem('us', 'FI')).toBe('imperial');
    expect(defaultUnitSystem('metric', 'US')).toBe('metric');
    expect(defaultUnitSystem('uk', 'GB')).toBe('metric');
  });

  it('falls back to the region', () => {
    expect(defaultUnitSystem(null, 'US')).toBe('imperial');
    expect(defaultUnitSystem(null, 'us')).toBe('imperial');
    expect(defaultUnitSystem(null, 'SE')).toBe('metric');
    expect(defaultUnitSystem(undefined, null)).toBe('metric');
  });
});

describe('conversions', () => {
  it('converts weight both ways', () => {
    expect(kgToLb(1)).toBeCloseTo(2.20462, 4);
    expect(lbToKg(kgToLb(72.5))).toBeCloseTo(72.5, 10);
    expect(displayWeight(80, 'metric')).toBe(80);
    expect(weightToKg(displayWeight(80, 'imperial'), 'imperial')).toBeCloseTo(80, 10);
  });

  it('converts food amounts', () => {
    expect(gToOz(28.349523125)).toBeCloseTo(1, 10);
    expect(mlToFlOz(flOzToMl(8))).toBeCloseTo(8, 10);
  });

  it('converts height to whole feet and inches', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(cmToFeetInches(182.88)).toEqual({ feet: 6, inches: 0 });
    expect(cmToFeetInches(152)).toEqual({ feet: 5, inches: 0 });
    expect(feetInchesToCm(5, 11)).toBeCloseTo(180.34, 2);
  });
});
