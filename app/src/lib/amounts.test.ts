import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID } from '@/data/catalog/ingredients';
import { setActiveLanguage } from '@/i18n/locale';

import { formatAmount, formatCount, formatGrams, formatPackage } from './amounts';

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
      expect(nbsp(formatPackage(INGREDIENTS_BY_ID.lemon, 'imperial'))).toBe('1 pc');
      expect(nbsp(formatPackage(INGREDIENTS_BY_ID['chicken-breast'], 'imperial'))).toBe('14 oz');
      expect(nbsp(formatPackage(INGREDIENTS_BY_ID.carrot, 'imperial'))).toBe('2.2 lb');
    } finally {
      setActiveLanguage('fi');
    }
  });
});
