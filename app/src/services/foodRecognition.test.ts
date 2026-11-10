import { describe, expect, it } from '@jest/globals';

import { FOODS_BY_ID } from '@/data/catalog';

import { foodRecognition, needsCheck, parseRecognitionResponse } from './foodRecognition';
import { testDataPlate } from './foodRecognitionTestData';

const known = (id: string) => FOODS_BY_ID[id] !== undefined;

describe('food recognition', () => {
  it('runs in test mode until the backend phase', () => {
    expect(foodRecognition.mode).toBe('test');
  });

  it('never marks test results as sure: they carry no confidence at all', () => {
    for (let i = 0; i < 20; i++) {
      for (const food of testDataPlate(`file:///p-${i}.jpg`)) {
        expect(food.confidence).toBeUndefined();
        expect(needsCheck(food)).toBe(false);
      }
    }
  });

  it('flags only uncertain live results for checking', () => {
    expect(needsCheck({ foodId: 'x', grams: 100, confidence: 0.3 })).toBe(true);
    expect(needsCheck({ foodId: 'x', grams: 100, confidence: 0.9 })).toBe(false);
  });
});

describe('parseRecognitionResponse', () => {
  it('keeps foods from the closed list and drops unknown ids', () => {
    const result = parseRecognitionResponse(
      {
        foods: [
          { foodId: 'chicken-breast', grams: 140.4, confidence: 0.8 },
          { foodId: 'unicorn-steak', grams: 200 },
        ],
      },
      known,
    );
    expect(result).toEqual([{ foodId: 'chicken-breast', grams: 140, confidence: 0.8 }]);
  });

  it('clamps implausible grams', () => {
    const [low, high] = parseRecognitionResponse(
      { foods: [{ foodId: 'chicken-breast', grams: 0 }, { foodId: 'rice-cooked', grams: 9000 }] },
      known,
    );
    expect(low.grams).toBe(1);
    expect(high.grams).toBe(2000);
  });

  it('rejects malformed responses instead of guessing', () => {
    expect(() => parseRecognitionResponse({ foods: 'chicken' }, known)).toThrow();
    expect(() => parseRecognitionResponse({ foods: [{ foodId: 'rice-cooked', grams: 'lots' }] }, known)).toThrow();
    expect(() => parseRecognitionResponse({ foods: [{ foodId: 'rice-cooked', grams: 10, confidence: 2 }] }, known)).toThrow();
    // Macros from the model are not part of the contract and never reach the app.
    const [food] = parseRecognitionResponse(
      { foods: [{ foodId: 'rice-cooked', grams: 150, kcal: 9999 }] },
      known,
    );
    expect(food).toEqual({ foodId: 'rice-cooked', grams: 150, confidence: undefined });
  });
});
