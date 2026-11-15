import { describe, expect, it } from '@jest/globals';

import { currencySymbol, formatMoney, formatWholeMoney } from './index';

const nbsp = /[  ]/g;
const plain = (value: string) => value.replace(nbsp, ' ');

describe('money formatting by price region', () => {
  it('formats euros the Finnish way', () => {
    expect(plain(formatMoney(420, 'FI'))).toBe('4,20 €');
    expect(plain(formatWholeMoney(6600, 'FI'))).toBe('66 €');
  });

  it('uses the short symbol, never the ISO code', () => {
    for (const region of ['SE', 'NO', 'DK', 'GB', 'US'] as const) {
      const text = formatMoney(5010, region);
      expect(text).not.toMatch(/SEK|NOK|DKK|GBP|USD/);
    }
    expect(plain(formatMoney(5010, 'SE'))).toBe('50,10 kr');
    expect(currencySymbol('SE')).toBe('kr');
    expect(currencySymbol('GB')).toBe('£');
  });
});
