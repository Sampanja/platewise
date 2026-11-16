import { describe, expect, it } from '@jest/globals';

import { FOODS_BY_ID } from '@/data/catalog';
import { parseFoodTextLocally } from '@/services/foodTextParser';

import { phraseGrams, queryVariants, splitFoodText } from './foodText';

describe('splitFoodText', () => {
  it('reads amounts, units and toppings in Finnish', () => {
    const phrases = splitFoodText('kaksi ruisleipää juustolla ja kahvi maidolla');
    expect(phrases.map((p) => [p.query, p.quantity, p.unit])).toEqual([
      ['ruisleipaa', 2, null],
      ['juustolla', 2, null],
      ['kahvi', 1, null],
      ['maidolla', 1, null],
    ]);
  });

  it('reads English and Swedish with units and decimal commas', () => {
    expect(splitFoodText('two slices of rye bread with cheese').map((p) => [p.query, p.quantity, p.unit])).toEqual([
      ['rye bread', 2, 'slice'],
      ['cheese', 2, null],
    ]);
    expect(splitFoodText('1,5 dl mjölk och en banan').map((p) => [p.query, p.quantity, p.unit])).toEqual([
      ['mjolk', 1.5, 'dl'],
      ['banan', 1, null],
    ]);
    expect(splitFoodText('200g kanaa')[0]).toMatchObject({ query: 'kanaa', quantity: 200, unit: 'g' });
  });

  it('reads size words', () => {
    expect(splitFoodText('iso omena')[0]).toMatchObject({ query: 'omena', size: 1.5 });
  });
});

describe('queryVariants', () => {
  it('finds Finnish base forms', () => {
    expect(queryVariants('maidolla')).toContain('maito');
    expect(queryVariants('ruisleipaa')).toContain('ruisleipa');
    expect(queryVariants('juustolla')).toContain('juusto');
  });
});

describe('phraseGrams', () => {
  const portions = [
    { grams: 35, labels: ['1 palalevy', '1 piece', '1 bit'] },
    { grams: 30, labels: ['1 viipale', '1 slice', '1 skiva'] },
  ];
  it('uses weights and volumes as they are', () => {
    expect(phraseGrams({ text: '', query: 'x', quantity: 2, unit: 'dl', size: 1 }, portions)).toBe(200);
    expect(phraseGrams({ text: '', query: 'x', quantity: 150, unit: 'g', size: 1 }, portions)).toBe(150);
  });
  it('uses the portion that names the unit, else the first', () => {
    expect(phraseGrams({ text: '', query: 'x', quantity: 2, unit: 'slice', size: 1 }, portions)).toBe(60);
    expect(phraseGrams({ text: '', query: 'x', quantity: 2, unit: null, size: 1 }, portions)).toBe(70);
  });
});

describe('parseFoodTextLocally (closed food list)', () => {
  it('turns a Finnish sentence into foods from the list', () => {
    const result = parseFoodTextLocally('kaksi ruisleipää juustolla ja kahvi maidolla');
    const ids = result.foods.map((f) => f.foodId);
    expect(ids[0]).toBe('rye-bread');
    expect(ids.length).toBeGreaterThanOrEqual(3);
    for (const food of result.foods) expect(FOODS_BY_ID[food.foodId]).toBeDefined();
  });

  it('prefers a food named like the whole phrase ("Kahvi maidolla")', () => {
    expect(parseFoodTextLocally('kahvi maidolla').foods.map((f) => f.foodId)).toEqual(['coffee-milk']);
  });

  it('reads an adessive topping as its base food, not a dish named with it', () => {
    const ids = parseFoodTextLocally('ruisleipä maidolla').foods.map((f) => f.foodId);
    expect(ids[0]).toBe('rye-bread');
    expect(ids[1]).not.toBe('oat-porridge-milk');
  });

  it('survives an unknown word next to a food', () => {
    expect(parseFoodTextLocally('ksi ruisleipää').foods[0]?.foodId).toBe('rye-bread');
  });

  it('works in English and Swedish too', () => {
    expect(parseFoodTextLocally('two slices of rye bread').foods[0]?.foodId).toBe('rye-bread');
    expect(parseFoodTextLocally('en skiva rågbröd').foods[0]?.foodId).toBe('rye-bread');
  });

  it('reports words it does not understand instead of guessing', () => {
    const result = parseFoodTextLocally('xqzzv');
    expect(result.foods).toEqual([]);
    expect(result.unmatched).toEqual(['xqzzv']);
  });
});
