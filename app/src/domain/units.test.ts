import { describe, expect, it } from '@jest/globals';

import {
  cmToFeetInches,
  cToF,
  defaultUnits,
  displayEnergy,
  displayFood,
  displayLiquid,
  displayTemperature,
  displayWeight,
  energyToKcal,
  feetInchesToCm,
  flOzToMl,
  foodToGrams,
  gToOz,
  IMPERIAL_UNITS,
  isUnitPrefs,
  kcalToKj,
  kgToLb,
  kgToStonesPounds,
  kjToKcal,
  lbToKg,
  liquidToMl,
  METRIC_UNITS,
  mlToFlOz,
  ozToG,
  practicalAmount,
  roundTo,
  stonesPoundsToKg,
  UNIT_CHOICES,
  UNIT_KINDS,
  unitPreset,
  unitsFromSystem,
  weightStep,
  weightToKg,
} from './units';

describe('defaultUnits', () => {
  it('follows the phone when it reports a system', () => {
    expect(defaultUnits('us', 'FI')).toEqual(IMPERIAL_UNITS);
    expect(defaultUnits('metric', 'US')).toEqual(METRIC_UNITS);
  });

  it('suggests metric almost everywhere and imperial in the US', () => {
    expect(defaultUnits(null, 'FI')).toEqual(METRIC_UNITS);
    expect(defaultUnits(null, 'SE')).toEqual(METRIC_UNITS);
    expect(defaultUnits(null, 'US')).toEqual(IMPERIAL_UNITS);
    expect(defaultUnits(null, 'us')).toEqual(IMPERIAL_UNITS);
    expect(defaultUnits(undefined, null)).toEqual(METRIC_UNITS);
  });

  it('gives the UK grams and millilitres but stones and feet', () => {
    const uk = { ...METRIC_UNITS, weight: 'st', height: 'ftin' };
    expect(defaultUnits('uk', 'GB')).toEqual(uk);
    expect(defaultUnits(null, 'GB')).toEqual(uk);
  });

  it('returns a fresh object every time', () => {
    const a = defaultUnits(null, 'FI');
    a.weight = 'lb';
    expect(defaultUnits(null, 'FI').weight).toBe('kg');
  });
});

describe('presets and validation', () => {
  it('names the quick choices and anything else custom', () => {
    expect(unitPreset(METRIC_UNITS)).toBe('metric');
    expect(unitPreset(IMPERIAL_UNITS)).toBe('imperial');
    expect(unitPreset({ ...METRIC_UNITS, energy: 'kj' })).toBe('custom');
    expect(unitPreset({ ...IMPERIAL_UNITS, temperature: 'c' })).toBe('custom');
  });

  it('maps the old single setting', () => {
    expect(unitsFromSystem('metric')).toEqual(METRIC_UNITS);
    expect(unitsFromSystem('imperial')).toEqual(IMPERIAL_UNITS);
  });

  it('accepts only complete, known preferences', () => {
    expect(isUnitPrefs(METRIC_UNITS)).toBe(true);
    expect(isUnitPrefs({ ...METRIC_UNITS, weight: 'st' })).toBe(true);
    expect(isUnitPrefs({ ...METRIC_UNITS, weight: 'cubits' })).toBe(false);
    const { energy: _energy, ...missing } = METRIC_UNITS;
    expect(isUnitPrefs(missing)).toBe(false);
    expect(isUnitPrefs(null)).toBe(false);
    expect(isUnitPrefs('metric')).toBe(false);
  });

  it('offers every kind with at least two choices, both presets included', () => {
    for (const kind of UNIT_KINDS) {
      const choices = UNIT_CHOICES[kind] as readonly string[];
      expect(choices.length).toBeGreaterThanOrEqual(2);
      expect(choices).toContain(METRIC_UNITS[kind]);
      expect(choices).toContain(IMPERIAL_UNITS[kind]);
    }
  });
});

describe('conversions', () => {
  it('converts weight both ways', () => {
    expect(kgToLb(1)).toBeCloseTo(2.20462, 4);
    expect(lbToKg(kgToLb(72.5))).toBeCloseTo(72.5, 10);
    expect(weightToKg(154, 'lb')).toBeCloseTo(69.85, 2);
    expect(weightToKg(70, 'kg')).toBe(70);
  });

  it('converts stones and pounds with the pounds rolling over', () => {
    expect(kgToStonesPounds(70)).toEqual({ stones: 11, pounds: 0.3 });
    expect(kgToStonesPounds(stonesPoundsToKg(12, 13.95))).toEqual({ stones: 13, pounds: 0 });
    expect(stonesPoundsToKg(11, 0)).toBeCloseTo(69.85, 2);
    expect(kgToStonesPounds(stonesPoundsToKg(10, 6.4))).toEqual({ stones: 10, pounds: 6.4 });
  });

  it('converts food amounts and liquids both ways', () => {
    expect(gToOz(28.349523125)).toBeCloseTo(1, 10);
    expect(ozToG(gToOz(250))).toBeCloseTo(250, 10);
    expect(mlToFlOz(flOzToMl(8))).toBeCloseTo(8, 10);
    expect(foodToGrams(displayFood(137, 'oz'), 'oz')).toBeCloseTo(137, 10);
    expect(foodToGrams(137, 'g')).toBe(137);
    expect(liquidToMl(displayLiquid(330, 'cup'), 'cup')).toBeCloseTo(330, 10);
    expect(displayLiquid(330, 'ml')).toBe(330);
  });

  it('converts height to whole feet and inches', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(cmToFeetInches(182.88)).toEqual({ feet: 6, inches: 0 });
    expect(cmToFeetInches(152)).toEqual({ feet: 5, inches: 0 });
    expect(feetInchesToCm(5, 11)).toBeCloseTo(180.34, 2);
  });

  it('converts energy with the label factor 4.184', () => {
    expect(kcalToKj(1)).toBe(4.184);
    expect(kjToKcal(kcalToKj(1850))).toBeCloseTo(1850, 10);
    expect(energyToKcal(8368, 'kj')).toBeCloseTo(2000, 10);
    expect(energyToKcal(2000, 'kcal')).toBe(2000);
  });

  it('converts temperatures', () => {
    expect(cToF(100)).toBe(212);
    expect(cToF(0)).toBe(32);
  });
});

describe('rounding', () => {
  it('shows body weight to 0.1 in the chosen unit', () => {
    expect(displayWeight(72.46, 'kg')).toBe(72.5);
    expect(displayWeight(70, 'lb')).toBe(154.3);
    expect(displayWeight(70, 'st')).toBe(154.3);
    expect(weightStep('kg')).toBe(0.1);
    expect(weightStep('lb')).toBe(0.2);
  });

  it('shows energy as whole numbers', () => {
    expect(displayEnergy(1849.6, 'kcal')).toBe(1850);
    expect(displayEnergy(2000, 'kj')).toBe(8368);
    expect(displayEnergy(1, 'kj')).toBe(4);
  });

  it('sets oven temperatures the way US ovens do', () => {
    expect(displayTemperature(200, 'f')).toBe(400);
    expect(displayTemperature(175, 'f')).toBe(350);
    expect(displayTemperature(180, 'f')).toBe(350);
    expect(displayTemperature(225, 'f')).toBe(425);
    expect(displayTemperature(150, 'f')).toBe(300);
    expect(displayTemperature(250, 'f')).toBe(475);
  });

  it('keeps food safety temperatures precise', () => {
    expect(displayTemperature(75, 'f')).toBe(165);
    expect(displayTemperature(63, 'f')).toBe(145);
    expect(displayTemperature(70, 'f')).toBe(160);
    expect(displayTemperature(200, 'c')).toBe(200);
  });

  it('snaps kitchen amounts to practical fractions', () => {
    expect(practicalAmount(0.1)).toBe(0.25);
    expect(practicalAmount(0.4)).toBe(0.5);
    expect(practicalAmount(0.7)).toBe(0.75);
    expect(practicalAmount(1.3)).toBe(1.5);
    expect(practicalAmount(2.2)).toBe(2);
    expect(practicalAmount(12.4)).toBe(12);
    expect(practicalAmount(0)).toBe(0);
  });

  it('rounds without binary noise', () => {
    expect(roundTo(0.1 + 0.2, 1)).toBe(0.3);
    expect(roundTo(72.45, 1)).toBe(72.5);
  });
});
