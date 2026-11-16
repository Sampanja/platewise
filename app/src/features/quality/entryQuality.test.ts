import { describe, expect, it, jest } from '@jest/globals';

import { FOODS_BY_ID } from '@/data/catalog';

import { dayQuality, entryQuality } from './entryQuality';

// The diary layer reads custom foods from a persisted store (jest hoists this above the imports).
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('diary quality', () => {
  const food = (foodId: string, grams: number) => ({
    basis: { kind: 'food' as const, foodId, per100g: FOODS_BY_ID[foodId].per100g },
    quantity: grams,
  });

  it('grades a logged food and skips quick entries', () => {
    expect(entryQuality(food('broccoli', 100))?.grade).toBe('A');
    expect(entryQuality({ basis: { kind: 'quick' } })).toBeNull();
  });

  it('mixes a day by grams, so more vegetables raise it', () => {
    const sweets = dayQuality([food('milk-chocolate', 100)]);
    const balanced = dayQuality([food('milk-chocolate', 100), food('broccoli', 300), food('rye-bread', 100)]);
    expect(sweets && balanced && balanced.points < sweets.points).toBe(true);
    expect(dayQuality([])).toBeNull();
  });
});
