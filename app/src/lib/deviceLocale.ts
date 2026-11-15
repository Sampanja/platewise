import { getCalendars, getLocales, useLocales } from 'expo-localization';

/**
 * The phone's language, region and calendar settings (expo-localization).
 * Wrapped so the rest of the app never touches the native module directly and
 * gets safe values in tests or if the module is unavailable.
 */
export type DeviceLocale = {
  /** e.g. "fi", "en", "sv"; null if unknown. */
  languageCode: string | null;
  /** e.g. "FI", "SE", "US"; null if unknown. */
  regionCode: string | null;
  measurementSystem: 'metric' | 'us' | 'uk' | null;
  /** 1 = Sunday … 7 = Saturday, as expo-localization reports it. */
  firstWeekday: number | null;
};

const UNKNOWN: DeviceLocale = { languageCode: null, regionCode: null, measurementSystem: null, firstWeekday: null };

function firstWeekday(): number | null {
  try {
    return getCalendars()[0]?.firstWeekday ?? null;
  } catch {
    return null;
  }
}

function fromLocale(locale: ReturnType<typeof getLocales>[number] | undefined): DeviceLocale {
  if (!locale) return UNKNOWN;
  return {
    languageCode: locale.languageCode ?? null,
    regionCode: locale.regionCode ?? null,
    measurementSystem: locale.measurementSystem ?? null,
    firstWeekday: firstWeekday(),
  };
}

export function deviceLocale(): DeviceLocale {
  try {
    return fromLocale(getLocales()[0]);
  } catch {
    return UNKNOWN;
  }
}

/** Same as a hook: updates when the phone's settings change while the app runs. */
export function useDeviceLocale(): DeviceLocale {
  const locales = useLocales();
  const first = locales[0];
  return fromLocale(first);
}
