import { describe, expect, it } from '@jest/globals';

import { closestGuide, portionGuides } from './portionGuides';

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

