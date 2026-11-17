import { describe, expect, it } from '@jest/globals';

import { IMPERIAL_UNITS, METRIC_UNITS } from '@/domain/units';

import {
  dropHouseholdSize,
  planWithEaters,
  profileWithoutStore,
  waterToEntries,
  withLanguageSettings,
  withPriceRegion,
  withUnitPrefs,
} from './migrations';

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

describe('withPriceRegion (stores removed)', () => {
  it('turns an old chain into the Finnish price region', () => {
    expect(withPriceRegion({ id: 'p', chainCode: 'lidl', budgetCents: 5000 })).toEqual({
      id: 'p',
      budgetCents: 5000,
      priceRegion: 'FI',
    });
    expect(withPriceRegion({ id: 'p', chainCode: 'k_market' })).toEqual({ id: 'p', priceRegion: 'FI' });
  });
  it('keeps a valid region and repairs junk', () => {
    expect(withPriceRegion({ priceRegion: 'SE' })).toEqual({ priceRegion: 'SE' });
    expect(withPriceRegion({ priceRegion: 'XX' })).toEqual({ priceRegion: 'FI' });
    expect(withPriceRegion(null)).toBeNull();
  });
});

describe('profileWithoutStore', () => {
  it('drops the default store and keeps earlier users in Finland (their budget is in euros)', () => {
    expect(profileWithoutStore({ name: 'A', chainCode: 's_group', weeklyBudgetCents: 7500 }, 6)).toEqual({
      name: 'A',
      weeklyBudgetCents: 7500,
      priceRegion: 'FI',
    });
  });
  it('keeps a chosen region and "follow the phone" from v7 on', () => {
    expect(profileWithoutStore({ priceRegion: 'GB' }, 7)).toEqual({ priceRegion: 'GB' });
    expect(profileWithoutStore({ priceRegion: null }, 7)).toEqual({ priceRegion: null });
    expect(profileWithoutStore({ priceRegion: 'nope' }, 7)).toEqual({ priceRegion: null });
  });
});

describe('withLanguageSettings', () => {
  it('keeps Finnish for people who used the Finnish-only app', () => {
    expect(withLanguageSettings({ name: 'A', onboardingCompleted: true }, 7)).toEqual({
      name: 'A',
      onboardingCompleted: true,
      language: 'fi',
      languageChosen: true,
    });
  });

  it('sends new installs to the language picker', () => {
    expect(withLanguageSettings({ onboardingCompleted: false }, 7)).toMatchObject({ language: null, languageChosen: false });
    expect(withLanguageSettings({}, 0)).toMatchObject({ language: null, languageChosen: false });
  });

  it('drops unknown languages without crashing', () => {
    expect(withLanguageSettings({ language: 'xx', languageChosen: true }, 8)).toMatchObject({ language: null, languageChosen: true });
    expect(withLanguageSettings({ language: 'sv' }, 8)).toMatchObject({ language: 'sv' });
    expect(withLanguageSettings(null, 7)).toBeNull();
  });
});

describe('withUnitPrefs', () => {
  const uk = { ...METRIC_UNITS, weight: 'st' as const, height: 'ftin' as const };

  it('turns the old single setting into separate units', () => {
    expect(withUnitPrefs({ unitSystem: 'imperial', onboardingCompleted: true }, 9, METRIC_UNITS)).toEqual({
      onboardingCompleted: true,
      units: IMPERIAL_UNITS,
      unitsChosen: true,
    });
    expect(withUnitPrefs({ unitSystem: 'metric', onboardingCompleted: true }, 9, IMPERIAL_UNITS)).toMatchObject({ units: METRIC_UNITS });
  });

  it('keeps the automatic choice of onboarded users as their own setting', () => {
    expect(withUnitPrefs({ unitSystem: null, onboardingCompleted: true }, 9, uk)).toMatchObject({ units: uk, unitsChosen: true });
    expect(withUnitPrefs({ onboardingCompleted: true }, 7, IMPERIAL_UNITS)).toMatchObject({ units: IMPERIAL_UNITS });
  });

  it('sends people in the middle of onboarding to the units screen', () => {
    expect(withUnitPrefs({ unitSystem: null, onboardingCompleted: false }, 9, uk)).toEqual({
      onboardingCompleted: false,
      units: null,
      unitsChosen: false,
    });
  });

  it('keeps valid v10 units and repairs broken ones', () => {
    const custom = { ...METRIC_UNITS, energy: 'kj' as const };
    expect(withUnitPrefs({ units: custom, unitsChosen: true }, 10, METRIC_UNITS)).toEqual({ units: custom, unitsChosen: true });
    expect(withUnitPrefs({ units: { weight: 'cubits' }, onboardingCompleted: true }, 10, uk)).toMatchObject({ units: uk });
    expect(withUnitPrefs(null, 10, METRIC_UNITS)).toBeNull();
  });
});
