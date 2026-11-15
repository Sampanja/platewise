import { afterEach, describe, expect, it } from '@jest/globals';

import { formatBodyWeight, formatGrams, formatHeight, formatLiquid, formatWater } from '@/lib/amounts';
import { longDate, shortDate } from '@/lib/dates';

import { currencySymbol, formatDecimal, formatMoney, formatWholeMoney, parseDecimal } from './index';
import { setActiveLanguage, setActivePriceRegion, setActiveUnitSystem } from './locale';

const nbsp = /[  ]/g;
const plain = (value: string) => value.replace(nbsp, ' ');

afterEach(() => {
  setActiveLanguage('fi');
  setActivePriceRegion('FI');
  setActiveUnitSystem('metric');
});

describe('money formatting by price region', () => {
  it('formats euros the Finnish way', () => {
    expect(plain(formatMoney(420, 'FI'))).toBe('4,20 €');
    expect(plain(formatWholeMoney(6600, 'FI'))).toBe('66 €');
  });

  it('uses the short symbol, never the ISO code', () => {
    for (const region of ['SE', 'NO', 'DK', 'GB', 'US'] as const) {
      expect(formatMoney(5010, region)).not.toMatch(/SEK|NOK|DKK|GBP|USD/);
    }
    expect(plain(formatMoney(5010, 'SE'))).toBe('50,10 kr');
    expect(currencySymbol('SE')).toBe('kr');
    expect(currencySymbol('GB')).toBe('£');
  });

  it('follows the language for separators and symbol position', () => {
    setActiveLanguage('en');
    setActivePriceRegion('GB');
    expect(formatMoney(420)).toBe('£4.20');
    expect(plain(formatMoney(80000, 'SE'))).toBe('800.00 kr');
    setActiveLanguage('sv');
    setActivePriceRegion('SE');
    expect(plain(formatMoney(5010))).toBe('50,10 kr');
  });
});

describe('numbers and dates by language', () => {
  it('uses the language’s decimal separator and parses both', () => {
    expect(formatDecimal(75.5)).toBe('75,5');
    setActiveLanguage('en');
    expect(formatDecimal(75.5)).toBe('75.5');
    expect(parseDecimal('75,5')).toBe(75.5);
    expect(parseDecimal('75.5')).toBe(75.5);
  });

  it('formats weekday labels per language', () => {
    expect(shortDate('2026-10-30')).toBe('pe 30.10.');
    expect(longDate('2026-10-30')).toBe('perjantai 30.10.');
    setActiveLanguage('sv');
    expect(longDate('2026-10-30')).toMatch(/^fredag 30/);
    setActiveLanguage('en');
    expect(longDate('2026-10-30')).toMatch(/^Friday 30/);
  });
});

describe('unit systems', () => {
  it('shows metric amounts by default', () => {
    expect(formatGrams(250)).toBe('250 g');
    expect(formatLiquid(200)).toBe('2 dl');
    expect(formatBodyWeight(72.5)).toBe('72,5 kg');
    expect(formatHeight(180)).toBe('180 cm');
    expect(formatWater(1500)).toBe('1,5 l');
  });

  it('shows imperial amounts when chosen', () => {
    setActiveLanguage('en');
    setActiveUnitSystem('imperial');
    expect(formatGrams(113)).toBe('4 oz');
    expect(formatGrams(907)).toBe('2 lb');
    expect(formatLiquid(240)).toBe('1 cup');
    expect(formatLiquid(15)).toBe('1 tbsp');
    expect(formatBodyWeight(72.5)).toBe('159.8 lb');
    expect(formatHeight(180)).toBe('5 ft 11 in');
    expect(formatWater(1500)).toBe('51 fl oz');
  });
});
