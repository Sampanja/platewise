import { describe, expect, it } from '@jest/globals';

import { searchCatalogFoods, searchIngredients } from '@/data/catalog/search';

import { editDistance, foldText, matchScore } from './fuzzy';

describe('fuzzy matching', () => {
  it('folds case, accents and punctuation', () => {
    expect(foldText('Kermaviili, 10 %')).toBe('kermaviili 10');
    expect(foldText('Lök')).toBe('lok');
    expect(foldText('Crème fraîche')).toBe('creme fraiche');
  });

  it('measures edit distance with an early exit', () => {
    expect(editDistance('tomaatti', 'tomati')).toBe(2);
    expect(editDistance('a', 'abcdefgh', 2)).toBe(3);
  });

  it('scores exact above prefix above typo, and needs every word', () => {
    const exact = matchScore('maito', 'Maito');
    const prefix = matchScore('mai', 'Maito');
    const inflected = matchScore('maitoa', 'Maito');
    const typo = matchScore('maiot', 'Maito');
    expect(exact).toBe(1);
    expect(inflected).toBeGreaterThan(typo);
    expect(prefix).toBeGreaterThan(0);
    expect(matchScore('maito kaura', 'Maito')).toBe(0);
  });
});

describe('catalog search in every language', () => {
  const firstId = (query: string) => searchIngredients(query)[0]?.item.id;

  it('finds ingredients by Finnish, English and Swedish names', () => {
    expect(firstId('sipuli')).toBe('onion');
    expect(firstId('onion')).toBe('onion');
    expect(firstId('lök')).toBe('onion');
    expect(firstId('porkkanat')).toBe('carrot');
    expect(firstId('tomatoes')).toBe('tomato');
  });

  it('tolerates a typo', () => {
    expect(firstId('porkana')).toBe('carrot');
  });

  it('finds diary foods by any language', () => {
    expect(searchCatalogFoods('ruisleipä').length).toBeGreaterThan(0);
    expect(searchCatalogFoods('rye bread').length).toBeGreaterThan(0);
  });

  it('returns nothing for an empty query or nonsense', () => {
    expect(searchIngredients('')).toEqual([]);
    expect(searchIngredients('xqzzv')).toEqual([]);
  });
});
