import { describe, expect, it } from '@jest/globals';

import { dropHouseholdSize, planWithEaters, waterToEntries } from './migrations';

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

describe('waterToEntries', () => {
  it('turns old daily totals into one entry per day', () => {
    const result = waterToEntries({ byDate: { '2026-11-08': 1500, '2026-11-09': 750, bad: 3 }, goalMl: 1500 });
    expect(result.entries).toEqual([
      { id: 'legacy-2026-11-08', date: '2026-11-08', time: null, ml: 1500, drink: 'water' },
      { id: 'legacy-2026-11-09', date: '2026-11-09', time: null, ml: 750, drink: 'water' },
    ]);
    expect(result.goalMode).toBe('auto');
  });

  it('keeps an own goal as a manual goal', () => {
    expect(waterToEntries({ byDate: {}, goalMl: 2200 })).toMatchObject({ goalMode: 'manual', manualGoalMl: 2200 });
  });

  it('survives missing or broken saved data', () => {
    for (const saved of [undefined, null, 'x', { byDate: 'x' }, { byDate: { '2026-11-09': -5 } }]) {
      expect(waterToEntries(saved)).toMatchObject({ entries: [], goalMode: 'auto' });
    }
  });
});
