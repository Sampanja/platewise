/**
 * Saved-state migrations for the local repositories, kept pure so they are
 * unit tested. Each takes whatever was saved (possibly from an old app
 * version, possibly partial) and returns a value safe for the current one.
 */

import { PRICE_REGION_CODES } from '@/domain/priceRegion';
import { isUnitSystem } from '@/domain/units';
import { isLanguage } from '@/i18n/languages';

type Loose = Record<string, unknown>;

function isObject(value: unknown): value is Loose {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Platewise is a single-person app: the household size was removed from the
 * profile (v5). The number of eaters is chosen per plan in the questionnaire.
 */
export function dropHouseholdSize<T>(profile: T): T {
  if (!isObject(profile) || !('householdSize' in profile)) return profile;
  const { householdSize: _removed, ...rest } = profile;
  return rest as T;
}

/** Plans saved before v3 stored the plan's eaters as `householdSize`. */
export function planWithEaters<T>(plan: T): T {
  if (!isObject(plan)) return plan;
  const { householdSize, ...rest } = plan;
  if ('eaters' in rest) return rest as T;
  const eaters = typeof householdSize === 'number' && householdSize >= 1 && householdSize <= 6 ? householdSize : 1;
  return { ...rest, eaters } as T;
}

/**
 * Water v2 keeps every drink as an entry (time and type) instead of one total
 * per day. Old totals become one plain-water entry per day without a time;
 * an own goal that differs from the old 1.5 l default is kept as a manual
 * goal, otherwise the new personal (automatic) goal is used.
 */
export function waterToEntries(persisted: unknown): {
  entries: { id: string; date: string; time: null; ml: number; drink: 'water' }[];
  goalMode: 'auto' | 'manual';
  manualGoalMl: number;
} {
  const old = isObject(persisted) ? persisted : {};
  const byDate = isObject(old.byDate) ? old.byDate : {};
  const entries = Object.entries(byDate)
    .filter(([date, ml]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && typeof ml === 'number' && ml > 0)
    .map(([date, ml]) => ({ id: `legacy-${date}`, date, time: null, ml: Math.min(8000, Math.round(ml as number)), drink: 'water' as const }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const goal = typeof old.goalMl === 'number' && old.goalMl >= 1000 && old.goalMl <= 4000 ? old.goalMl : null;
  const manual = goal !== null && goal !== 1500;
  return { entries, goalMode: manual ? 'manual' : 'auto', manualGoalMl: manual ? goal : 2000 };
}

/**
 * Stores were removed (v4 plans, v7 profile): prices are average prices in a
 * price region. Everything saved before that was priced in Finland in euros,
 * so the old `chainCode` becomes the Finnish price region. A valid saved
 * region is kept; anything else falls back to Finland.
 */
export function withPriceRegion<T>(value: T): T {
  if (!isObject(value)) return value;
  const { chainCode: _removed, ...rest } = value;
  const region = rest.priceRegion;
  const valid = typeof region === 'string' && (PRICE_REGION_CODES as readonly string[]).includes(region);
  return { ...rest, priceRegion: valid ? region : 'FI' } as T;
}

/**
 * Profile v7: no default store. `priceRegion` null means "follow the phone";
 * people who used the app before keep the Finnish region their euro budget
 * was set in.
 */
export function profileWithoutStore<T>(profile: T, fromVersion: number): T {
  if (!isObject(profile)) return profile;
  const { chainCode: _removed, ...rest } = profile;
  if (fromVersion < 7) return { ...rest, priceRegion: 'FI' } as T;
  const region = rest.priceRegion;
  const valid = typeof region === 'string' && (PRICE_REGION_CODES as readonly string[]).includes(region);
  return { ...rest, priceRegion: valid ? region : null } as T;
}

/**
 * Profile v8: language and units. The app was Finnish-only before, so people
 * who already finished onboarding keep Finnish and skip the language picker;
 * new installs see the picker first. Units follow the region (null) until
 * chosen. Unknown values from a newer or broken save fall back the same way.
 */
export function withLanguageSettings<T>(profile: T, fromVersion: number): T {
  if (!isObject(profile)) return profile;
  const onboarded = profile.onboardingCompleted === true;
  if (fromVersion < 8) {
    return { ...profile, language: onboarded ? 'fi' : null, languageChosen: onboarded, unitSystem: null } as T;
  }
  const language = isLanguage(profile.language) ? profile.language : null;
  const unitSystem = isUnitSystem(profile.unitSystem) ? profile.unitSystem : null;
  return { ...profile, language, languageChosen: profile.languageChosen === true || onboarded, unitSystem } as T;
}
