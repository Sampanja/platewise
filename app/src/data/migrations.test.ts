import { describe, expect, it } from '@jest/globals';

import { dropHouseholdSize, planWithEaters } from './migrations';

describe('dropHouseholdSize', () => {
  it('removes the field and keeps everything else', () => {
    expect(dropHouseholdSize({ name: 'Sampo', householdSize: 3, weeklyBudgetCents: 7500 })).toEqual({
      name: 'Sampo',
      weeklyBudgetCents: 7500,
    });
  });
  it('tolerates missing, partial or odd saved state', () => {
    expect(dropHouseholdSize({ name: 'x' })).toEqual({ name: 'x' });
    expect(dropHouseholdSize(undefined)).toBeUndefined();
    expect(dropHouseholdSize(null)).toBeNull();
  });
});

describe('planWithEaters', () => {
  it('renames householdSize to eaters', () => {
    expect(planWithEaters({ id: 'p', householdSize: 2 })).toEqual({ id: 'p', eaters: 2 });
  });
  it('keeps an existing eaters value and falls back to 1 for junk', () => {
    expect(planWithEaters({ id: 'p', eaters: 3 })).toEqual({ id: 'p', eaters: 3 });
    expect(planWithEaters({ id: 'p', householdSize: 'x' })).toEqual({ id: 'p', eaters: 1 });
    expect(planWithEaters({ id: 'p' })).toEqual({ id: 'p', eaters: 1 });
  });
});
