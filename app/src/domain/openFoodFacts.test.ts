import { describe, expect, it } from '@jest/globals';

import { guessCategory, isValidBarcode, parseOffProduct } from './openFoodFacts';

const response = {
  status: 1,
  product: {
    product_name_fi: 'Kaurahiutale',
    product_name: 'Oat flakes',
    brands: 'Myllärin, Raisio',
    image_front_small_url: 'https://images.openfoodfacts.org/x.jpg',
    serving_quantity: '40',
    product_quantity: 1000,
    categories_tags: ['en:cereals-and-potatoes', 'en:breakfast-cereals', 'en:flakes'],
    nutriments: {
      'energy-kcal_100g': 372,
      proteins_100g: '13',
      carbohydrates_100g: 58.6,
      fat_100g: 7,
      fiber_100g: 10,
      sugars_100g: 1.2,
      salt_100g: 0.01,
    },
  },
};

describe('parseOffProduct', () => {
  it('turns a complete product into a barcode food with per-100 g values', () => {
    const result = parseOffProduct(response, '6408641000148', { serving: '1 annos', package: '1 pakkaus' });
    expect(result.status).toBe('found');
    if (result.status !== 'found') return;
    expect(result.food).toMatchObject({
      id: 'off:6408641000148',
      name: 'Kaurahiutale',
      brand: 'Myllärin',
      source: 'barcode',
      category: 'bread',
      per100g: { kcal: 372, proteinG: 13, carbsG: 58.6, fatG: 7, fiberG: 10, sugarG: 1.2, saltG: 0 },
    });
    expect(result.food.portions).toEqual([
      { label: '1 annos', grams: 40 },
      { label: '1 pakkaus', grams: 1000 },
    ]);
  });

  it('converts kJ when kcal is missing', () => {
    const nutriments = { ...response.product.nutriments, 'energy-kcal_100g': undefined, energy_100g: 1556 };
    const result = parseOffProduct({ ...response, product: { ...response.product, nutriments } }, '1');
    expect(result.status === 'found' && result.food.per100g.kcal).toBe(372);
  });

  it('reports a product without macros as incomplete, not as a food', () => {
    const json = { status: 1, product: { product_name: 'Mystery bar', nutriments: { 'energy-kcal_100g': 400 } } };
    expect(parseOffProduct(json, '1')).toEqual({
      status: 'incomplete',
      name: 'Mystery bar',
      brand: undefined,
      imageUrl: undefined,
    });
  });

  it('treats status 0, junk and impossible energy as not found or incomplete', () => {
    expect(parseOffProduct({ status: 0, status_verbose: 'product not found' }, '1')).toEqual({ status: 'notFound' });
    expect(parseOffProduct('not json', '1')).toEqual({ status: 'notFound' });
    const absurd = {
      status: 1,
      product: {
        product_name: 'X',
        nutriments: { 'energy-kcal_100g': 5000, proteins_100g: 1, carbohydrates_100g: 1, fat_100g: 1 },
      },
    };
    expect(parseOffProduct(absurd, '1').status).toBe('incomplete');
  });
});

describe('guessCategory', () => {
  it('maps OFF category tags to diary groups', () => {
    expect(guessCategory(['en:beverages', 'en:sodas'])).toBe('drink');
    expect(guessCategory(['en:dairies', 'en:yogurts'])).toBe('dairy');
    expect(guessCategory(['en:snacks', 'en:chocolates'])).toBe('snack');
    expect(guessCategory(undefined)).toBe('meal');
  });
});

describe('isValidBarcode', () => {
  it('checks the EAN check digit', () => {
    expect(isValidBarcode('3017620422003')).toBe(true);
    expect(isValidBarcode('3017620422004')).toBe(false);
    expect(isValidBarcode('96385074')).toBe(true);
    expect(isValidBarcode('12345')).toBe(false);
  });
});
