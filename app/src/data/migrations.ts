/**
 * Saved-state migrations for the local repositories, kept pure so they are
 * unit tested. Each takes whatever was saved (possibly from an old app
 * version, possibly partial) and returns a value safe for the current one.
 */

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
