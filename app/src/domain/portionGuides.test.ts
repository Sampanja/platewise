import { describe, expect, it } from '@jest/globals';

import { closestGuide, confidenceLevel, portionGuides } from './portionGuides';

describe('portion guides', () => {
  it('offers a palm-sized portion for meat and a fist for starches', () => {
    expect(portionGuides('meat')[0]).toEqual({ key: 'palm', grams: 120 });
    expect(portionGuides('bread')[0].key).toBe('fist');
  });
  it('describes an amount by the closest guide', () => {
    expect(closestGuide('meat', 130)?.key).toBe('palm');
    expect(closestGuide('fat', 6)?.key).toBe('thumbTip');
    expect(closestGuide('meat', 0)).toBeNull();
  });
});

describe('confidenceLevel', () => {
  it('maps 0–1 to three plain levels', () => {
    expect(confidenceLevel(0.9)).toBe('high');
    expect(confidenceLevel(0.6)).toBe('medium');
    expect(confidenceLevel(0.3)).toBe('low');
  });
});
