import { afterEach, describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID } from '@/data/catalog/ingredients';
import { IMPERIAL_UNITS, METRIC_UNITS } from '@/domain/units';
import { setActiveLanguage, setActiveUnits } from '@/i18n/locale';

import {
  energyFromInput,
  foodInputText,
  formatAmount,
  formatBodyWeight,
  formatCount,
  formatEnergy,
  formatGrams,
  formatLiquid,
  formatPackage,
  formatTemperature,
  formatWaterRange,
  formatWeightChange,
  formatWeightRange,
  gramsFromInput,
  localizeRecipeText,
  localizeTemperatures,
} from './amounts';

const nbsp = (s: string) => s.replace(/ | /g, ' ');

describe('amounts', () => {
  it('formats counts with fractions', () => {
    expect(formatCount(0.5)).toBe('½');
    expect(formatCount(0.2)).toBe('¼');
    expect(formatCount(1.5)).toBe('1 ½');
    expect(formatCount(2)).toBe('2');
  });

  it('rounds grams sensibly', () => {
    expect(formatGrams(3.2)).toBe('3 g');
    expect(formatGrams(123)).toBe('125 g');
    expect(nbsp(formatGrams(1250))).toBe('1,3 kg');
  });

  it('shows pieces, liquids and weights the way people measure', () => {
    expect(formatAmount(INGREDIENTS_BY_ID.onion, 80)).toBe('1 sipuli');
    expect(formatAmount(INGREDIENTS_BY_ID.garlic, 10)).toBe('2 valkosipulinkynttä');
    expect(formatAmount(INGREDIENTS_BY_ID.cream, 200)).toBe('2 dl');
    expect(formatAmount(INGREDIENTS_BY_ID.oil, 15)).toBe('1 rkl');
    expect(formatAmount(INGREDIENTS_BY_ID['chicken-breast'], 300)).toBe('300 g');
  });

  it('describes packages', () => {
    expect(formatPackage(INGREDIENTS_BY_ID.milk)).toBe('1 l');
    expect(formatPackage(INGREDIENTS_BY_ID.lemon)).toBe('1 kpl');
    expect(formatPackage(INGREDIENTS_BY_ID.basil)).toBe('1 ruukku');
    expect(formatPackage(INGREDIENTS_BY_ID['chicken-breast'])).toBe('400 g');
  });

  it('formats packages in US units and English', () => {
    setActiveLanguage('en');
    try {
      expect(nbsp(formatPackage(INGREDIENTS_BY_ID.lemon, IMPERIAL_UNITS))).toBe('1 pc');
      expect(nbsp(formatPackage(INGREDIENTS_BY_ID['chicken-breast'], IMPERIAL_UNITS))).toBe('14 oz');
      expect(nbsp(formatPackage(INGREDIENTS_BY_ID.carrot, IMPERIAL_UNITS))).toBe('2.2 lb');
    } finally {
      setActiveLanguage('fi');
    }
  });
});

describe('units chosen one by one', () => {
  afterEach(() => setActiveUnits(METRIC_UNITS));

  it('shows energy in kcal or kJ', () => {
    expect(nbsp(formatEnergy(1850))).toBe('1 850 kcal');
    expect(nbsp(formatEnergy(2000, 'kj'))).toBe('8 368 kJ');
    setActiveUnits({ ...METRIC_UNITS, energy: 'kj' });
    expect(nbsp(formatEnergy(100))).toBe('418 kJ');
    expect(energyFromInput(418)).toBe(100);
  });

  it('shows body weight in kg, lb or stones and pounds', () => {
    expect(formatBodyWeight(72.5)).toBe('72,5 kg');
    expect(formatBodyWeight(70, 'lb')).toBe('154,3 lb');
    expect(formatBodyWeight(70, 'st')).toBe('11 st 0,3 lb');
    expect(formatWeightChange(-0.5, 'st')).toBe('−1,1 lb');
    expect(formatWeightRange(0.5, 2)).toBe('0,5–2 kg');
    expect(formatWeightRange(0.5, 2, 'lb')).toBe('1,1–4,4 lb');
  });

  it('mixes units freely: grams with cups, kg with fl oz', () => {
    setActiveUnits({ ...METRIC_UNITS, liquid: 'cup' });
    expect(formatGrams(250)).toBe('250 g');
    expect(formatLiquid(240)).toBe('1 kuppi');
    expect(formatAmount(INGREDIENTS_BY_ID.cream, 200)).toBe('¾ kuppia');
    expect(formatAmount(INGREDIENTS_BY_ID['chicken-breast'], 300)).toBe('300 g');
    expect(formatWaterRange(1000, 1500)).toBe('34–51 fl oz');
  });

  it('turns food fields into the user unit and back to grams', () => {
    expect(foodInputText(137)).toBe('137');
    expect(gramsFromInput(137)).toBe(137);
    setActiveUnits({ ...METRIC_UNITS, food: 'oz' });
    expect(foodInputText(137)).toBe('4,8');
    expect(gramsFromInput(4.8)).toBe(136);
    expect(formatGrams(113)).toBe('4 oz');
  });

  it('converts oven temperatures in recipe text', () => {
    expect(formatTemperature(200)).toBe('200 °C');
    expect(formatTemperature(200, 'f')).toBe('400 °F');
    const step = 'Paista 200 °C:ssa 20 minuuttia ja tarkista, että sisälämpö on 75 °C.';
    expect(localizeTemperatures(step)).toBe(step);
    expect(localizeTemperatures(step, 'f')).toBe('Paista 400 °F:ssa 20 minuuttia ja tarkista, että sisälämpö on 165 °F.');
    expect(localizeTemperatures('Bake at 175°C.', 'f')).toBe('Bake at 350 °F.');
  });

  it('converts amounts in recipe steps to cups and ounces', () => {
    const step = 'Lisää 2 dl vettä ja 30 g voita. Hauduta 15 minuuttia 175 °C:ssa.';
    expect(localizeRecipeText(step, METRIC_UNITS)).toBe(step);
    expect(localizeRecipeText(step, IMPERIAL_UNITS)).toBe('Lisää ¾ kuppia vettä ja 1 oz voita. Hauduta 15 minuuttia 350 °F:ssa.');
    expect(localizeRecipeText('Lisää 0,5 dl kermaa.', { ...METRIC_UNITS, liquid: 'cup' })).toBe('Lisää 3 ½ rkl kermaa.');
    // Words that merely contain a unit letter stay as they are.
    expect(localizeRecipeText('Paista 2 minuuttia, käännä 1 kerran.', IMPERIAL_UNITS)).toBe('Paista 2 minuuttia, käännä 1 kerran.');
  });
});
