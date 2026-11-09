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
