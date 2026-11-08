import { describe, expect, it } from '@jest/globals';

import { hyphenateFi, SOFT_HYPHEN } from './hyphenate';

const show = (text: string) => text.split(SOFT_HYPHEN).join('-');

describe('hyphenateFi', () => {
  it('breaks long compounds at syllable boundaries', () => {
    expect(show(hyphenateFi('tomaattikastikkeessa'))).toBe('to-maat-ti-kas-tik-kees-sa');
    expect(show(hyphenateFi('Jauhelihapenne'))).toBe('Jau-he-li-ha-pen-ne');
    expect(show(hyphenateFi('kookoskastikkeessa'))).toBe('koo-kos-kas-tik-kees-sa');
  });

  it('leaves short words and punctuation alone', () => {
    expect(hyphenateFi('Lohi ja riisi')).toBe('Lohi ja riisi');
    expect(hyphenateFi('Pihvi, perunat (uunissa)')).toBe('Pihvi, perunat (uunissa)');
  });

  it('never splits vowel sequences or leaves a single letter alone', () => {
    const result = show(hyphenateFi('Punajuurikeitto'));
    expect(result).toBe('Pu-na-juu-ri-keit-to');
    expect(result.split('-').every((part) => part.length >= 2)).toBe(true);
  });

  it('only adds invisible characters', () => {
    const text = 'Kana-kasvispaistettu riisi';
    expect(hyphenateFi(text).split(SOFT_HYPHEN).join('')).toBe(text);
  });
});
