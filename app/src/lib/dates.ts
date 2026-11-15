import { intlLocale, strings } from '@/i18n';
import { activeFirstWeekday } from '@/i18n/locale';

/** Calendar date in the user's local time zone, `YYYY-MM-DD`. */
export type LocalDate = string;

export function toLocalDate(date: Date): LocalDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses `YYYY-MM-DD` as local midnight (not UTC, unlike `new Date(string)`). */
export function parseLocalDate(value: LocalDate): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function today(): LocalDate {
  return toLocalDate(new Date());
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

/** Cached Intl.DateTimeFormat for the active language and region. */
function dateFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = intlLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

const asDate = (value: LocalDate | Date) => (typeof value === 'string' ? parseLocalDate(value) : value);

/** Short weekday name: "la", "Sat", "lör". */
export function weekdayShort(value: LocalDate | Date): string {
  return dateFormatter({ weekday: 'short' }).format(asDate(value)).replace(/\.$/, '');
}

/** Day and month: "1.11.", "1/11", "11/1". */
export function dayMonth(value: LocalDate | Date): string {
  return dateFormatter({ day: 'numeric', month: 'numeric' }).format(asDate(value));
}

/*
 * Weekday and date are formatted separately and joined: with both in one
 * pattern Finnish ICU inflects the weekday ("lauantaina 1.11."), which reads
 * wrong as a label.
 */

/** Weekday with day and month: "la 1.11.", "Sat 1/11", "lör 1/11". */
export function shortDate(value: LocalDate | Date): string {
  return `${weekdayShort(value)} ${dayMonth(value)}`;
}

/** Long weekday with day and month: "lauantai 1.11.", "Saturday 1/11", "lördag 1/11". */
export function longDate(value: LocalDate | Date): string {
  return `${dateFormatter({ weekday: 'long' }).format(asDate(value))} ${dayMonth(value)}`;
}

/** Full date for forecasts and history: "1.11.2026", "01/11/2026", "11/1/2026", "2026-11-01". */
export function numericDate(value: LocalDate | Date): string {
  return dateFormatter({ day: 'numeric', month: 'numeric', year: 'numeric' }).format(asDate(value));
}

/** "Tänään", "Huomenna" or e.g. "la 1.11.". */
export function relativeDayLabel(value: LocalDate, now: LocalDate = today()): string {
  if (value === now) return strings.dates.today;
  if (value === addDays(now, 1)) return strings.dates.tomorrow;
  return shortDate(value);
}

export function greeting(hour: number = new Date().getHours()): string {
  const g = strings.greetings;
  if (hour >= 5 && hour < 10) return g.morning;
  if (hour >= 10 && hour < 17) return g.day;
  if (hour >= 17 && hour < 23) return g.evening;
  return g.night;
}

/** Diary heading: "Tänään", "Eilen", "Huomenna" or e.g. "Torstai 30.10.". */
export function diaryDayLabel(value: LocalDate, now: LocalDate = today()): string {
  if (value === now) return strings.dates.today;
  if (value === addDays(now, -1)) return strings.dates.yesterday;
  if (value === addDays(now, 1)) return strings.dates.tomorrow;
  const label = longDate(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Monday-first weekday indexes (0 = Monday … 6 = Sunday, as in
 * domain/energy.ts) in the order the user's calendar shows them: Monday first
 * in most of Europe, Sunday first in the US.
 */
export function weekdayOrder(): number[] {
  const first = activeFirstWeekday();
  return Array.from({ length: 7 }, (_, i) => (first + i) % 7);
}
